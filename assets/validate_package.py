#!/usr/bin/env python3
"""Public WorldOracle submission-package structure checker.

This template validates only participant-visible archive and manifest rules. It
contains the public comparison-episode identifiers required for leaderboard
previews, but no ground-truth media, authoritative test-set manifest, private
evaluation criteria, infrastructure paths, credentials, or publication logic.
"""

import argparse
import json
import math
import shutil
import stat
import subprocess
import sys
import tempfile
import zipfile
from collections import defaultdict
from fractions import Fraction
from pathlib import Path, PurePosixPath


SCHEMA_VERSION = "preview-2"
MAX_ENTRIES = 20_000
MAX_PREDICTIONS = 10_000
MAX_METADATA_BYTES = 1024**2
TRACK_LIMITS = {
    "main": 3 * 1024**3,
    "policy": 3 * 1024**3,
    "long_horizon": 12 * 1024**3,
}
EMBODIMENT_FPS = {"agibot_g2": 30, "yam": 30, "human_hands": 15}
TASKS = {"pickfruit", "hangtowel", "pourwater", "pulldrawer"}
VIEW_SETS = {
    "single": {"top_head"},
    "multi": {"top_head", "hand_left", "hand_right"},
}
COMPARISON_EPISODES = {
    ("agibot_g2", "main"): ("hangtowel", "ep000000"),
    ("agibot_g2", "long_horizon"): ("hangtowel", "ep000000"),
    ("yam", "main"): ("hangtowel", "ep000000"),
    ("yam", "long_horizon"): ("hangtowel", "ep000000"),
    ("human_hands", "main"): ("hangtowel", "ep000000"),
    ("human_hands", "long_horizon"): ("hangtowel", "ep000000"),
    ("agibot_g2", "policy"): ("hangtowel", "ep000008"),
}


def reject(message):
    raise ValueError(message)


def strict_json_object(pairs):
    """Reject ambiguous duplicate keys at every JSON object level."""
    value = {}
    for key, item in pairs:
        if key in value:
            reject(f"manifest.json contains a duplicate key: {key}")
        value[key] = item
    return value


def strict_json_constant(value):
    reject(f"manifest.json contains a non-standard numeric value: {value}")


def probe_video(archive, media_path, expected_fps, track, scratch):
    ffprobe = shutil.which("ffprobe")
    ffmpeg = shutil.which("ffmpeg")
    if not ffprobe or not ffmpeg:
        reject("ffprobe and ffmpeg are required for media validation. Install FFmpeg or use --structure-only.")
    local = scratch / "prediction.mp4"
    try:
        with archive.open(media_path) as source, local.open("wb") as target:
            shutil.copyfileobj(source, target, length=1024**2)
        result = subprocess.run(
            [ffprobe, "-v", "error", "-protocol_whitelist", "file,pipe", "-f", "mov",
             "-select_streams", "v:0", "-show_entries",
             "stream=codec_name,width,height,avg_frame_rate,duration", "-of", "json", str(local)],
            capture_output=True, timeout=30, check=True,
        )
        stream = json.loads(result.stdout)["streams"][0]
        fps = float(Fraction(stream["avg_frame_rate"]))
        duration = float(stream["duration"])
        width, height = int(stream["width"]), int(stream["height"])
        if stream["codec_name"] != "h264":
            reject(f"{media_path}: use H.264 MP4.")
        if not math.isfinite(duration) or duration <= 0 or abs(fps - expected_fps) > .02:
            reject(f"{media_path}: actual video frame rate must be {expected_fps} FPS with valid timing.")
        if not 0 < width <= 8192 or not 0 < height <= 8192:
            reject(f"{media_path}: video dimensions must be between 1 and 8192 pixels.")
        if track == "main" and duration > 30 + 1 / fps + .01:
            reject(f"{media_path}: WorldOracle-Core videos must contain at most the first 30 seconds.")
        decoded = subprocess.run(
            [ffmpeg, "-v", "error", "-nostdin", "-threads", "1",
             "-protocol_whitelist", "file,pipe", "-f", "mov", "-i", str(local),
             "-frames:v", "1", "-vf", "scale=16:16", "-threads", "1", "-f", "rawvideo",
             "-pix_fmt", "rgb24", "pipe:1"],
            capture_output=True, timeout=30, check=True,
        )
        if len(decoded.stdout) != 16 * 16 * 3:
            reject(f"{media_path}: the first video frame cannot be decoded.")
        return {"fps": fps, "duration": duration}
    except (OSError, subprocess.SubprocessError, KeyError, IndexError, ZeroDivisionError,
            json.JSONDecodeError) as error:
        reject(f"{media_path}: MP4 inspection failed; use a readable H.264 video with valid timing ({error}).")
    finally:
        local.unlink(missing_ok=True)


def validate(package, inspect_media=True):
    if not package.is_file():
        reject(f"Package not found: {package}")
    with zipfile.ZipFile(package) as archive:
        entries = archive.infolist()
        if not 1 <= len(entries) <= MAX_ENTRIES:
            reject(f"The ZIP must contain between 1 and {MAX_ENTRIES:,} entries.")

        names = set()
        expanded_bytes = 0
        for entry in entries:
            name = entry.filename
            path = PurePosixPath(name)
            if (not name or name in names or name.startswith("/") or "\\" in name
                    or ".." in path.parts or ":" in name):
                reject("Duplicate or unsafe archive paths are not allowed.")
            names.add(name)
            mode = entry.external_attr >> 16
            if stat.S_ISLNK(mode) or entry.flag_bits & 1:
                reject("Symlinks and encrypted ZIP entries are not supported.")
            expanded_bytes += entry.file_size
            if entry.file_size > MAX_METADATA_BYTES and entry.file_size / max(entry.compress_size, 1) > 200:
                reject("An archive entry exceeds the compression-ratio safety limit.")

        for required in ("manifest.json", "README.md"):
            if required not in names:
                reject(f"Missing {required} at the ZIP root.")
            entry = archive.getinfo(required)
            if entry.is_dir() or entry.file_size > MAX_METADATA_BYTES:
                reject(f"{required} must be a file under 1 MiB.")

        try:
            manifest = json.loads(
                archive.read("manifest.json"),
                object_pairs_hook=strict_json_object,
                parse_constant=strict_json_constant,
            )
        except (UnicodeDecodeError, json.JSONDecodeError, RecursionError) as error:
            reject(f"manifest.json is not valid UTF-8 JSON: {error}")

        if not isinstance(manifest, dict) or manifest.get("schema_version") != SCHEMA_VERSION:
            reject(f"Use schema_version {SCHEMA_VERSION}.")
        allowed_fields = {"schema_version", "benchmark_track", "embodiment", "evaluation", "predictions"}
        unknown = sorted(set(manifest) - allowed_fields)
        if unknown:
            reject("Unknown top-level manifest fields: " + ", ".join(unknown))

        track = manifest.get("benchmark_track")
        embodiment = manifest.get("embodiment")
        if track not in TRACK_LIMITS:
            reject("benchmark_track must be main, policy, or long_horizon.")
        if embodiment not in EMBODIMENT_FPS:
            reject("embodiment must be agibot_g2, yam, or human_hands.")
        if track == "policy" and embodiment != "agibot_g2":
            reject("WorldOracle-Policy currently supports AgiBot G2 only.")
        if package.stat().st_size > TRACK_LIMITS[track] or expanded_bytes > TRACK_LIMITS[track]:
            reject("The ZIP or its expanded contents exceed the selected Track limit.")

        evaluation = manifest.get("evaluation")
        if not isinstance(evaluation, dict):
            reject("evaluation must be an object.")
        view_mode = evaluation.get("view_mode")
        if view_mode not in VIEW_SETS:
            reject("evaluation.view_mode must be single or multi.")
        expected_horizon = {"main": "30s", "policy": "policy", "long_horizon": "full"}[track]
        expected_source = "policy" if track == "policy" else "recorded"
        if evaluation.get("horizon") != expected_horizon:
            reject(f"evaluation.horizon must be {expected_horizon} for {track}.")
        if evaluation.get("action_source") != expected_source:
            reject(f"evaluation.action_source must be {expected_source} for {track}.")

        predictions = manifest.get("predictions")
        if not isinstance(predictions, list) or not 1 <= len(predictions) <= MAX_PREDICTIONS:
            reject(f"predictions must contain between 1 and {MAX_PREDICTIONS:,} entries.")
        files = {entry.filename for entry in entries if not entry.is_dir()}
        seen = set()
        seen_paths = set()
        episode_views = defaultdict(set)
        episode_media = defaultdict(list)
        expected_fps = EMBODIMENT_FPS[embodiment]
        with tempfile.TemporaryDirectory(prefix="worldoracle-public-validator-") as temporary:
            scratch = Path(temporary)
            for prediction in predictions:
                if not isinstance(prediction, dict):
                    reject("Each prediction must be an object.")
                for field in ("task", "episode_id", "view", "path"):
                    if not isinstance(prediction.get(field), str) or not prediction[field].strip():
                        reject(f"Each prediction needs a nonempty {field}.")
                if prediction["task"] not in TASKS:
                    reject("Unknown task in predictions. Use pickfruit, hangtowel, pourwater, or pulldrawer.")
                identity = (prediction["task"], prediction["episode_id"], prediction["view"])
                if identity in seen:
                    reject("Duplicate task / episode / view prediction.")
                seen.add(identity)
                episode_views[identity[:2]].add(identity[2])
                media_path = prediction["path"]
                if (media_path not in files or PurePosixPath(media_path).suffix.lower() != ".mp4"
                        or not media_path.startswith("predictions/")):
                    reject("Each prediction path must identify an MP4 under predictions/ inside the ZIP.")
                if media_path in seen_paths:
                    reject("Each prediction must use a distinct video path.")
                seen_paths.add(media_path)
                fps = prediction.get("fps")
                if isinstance(fps, bool) or fps != expected_fps:
                    reject(f"Each {embodiment} prediction must declare fps={expected_fps}.")
                if inspect_media:
                    episode_media[identity[:2]].append(
                        probe_video(archive, media_path, expected_fps, track, scratch)
                    )

        required_views = VIEW_SETS[view_mode]
        for (task, episode), views in episode_views.items():
            if views != required_views:
                reject(f"{task}/{episode} must contain exactly these views for {view_mode}: "
                       + ", ".join(sorted(required_views)))
            media = episode_media[(task, episode)]
            if media and any(
                    abs(item["fps"] - media[0]["fps"]) > .02
                    or abs(item["duration"] - media[0]["duration"]) > 1 / media[0]["fps"] + .01
                    for item in media):
                reject(f"{task}/{episode}: synchronized views must have matching frame rates and durations.")

        comparison = COMPARISON_EPISODES.get((embodiment, track))
        if comparison and any((*comparison, view) not in seen for view in required_views):
            reject(f"Include the canonical comparison episode {comparison[0]} / {comparison[1]} "
                   f"with every required {view_mode}-view prediction.")

        return {
            "template_validation": "passed",
            "media_validation": "passed" if inspect_media else "skipped",
            "schema_version": SCHEMA_VERSION,
            "benchmark_track": track,
            "view_mode": view_mode,
            "file_count": len(files),
            "prediction_count": len(predictions),
            "expanded_bytes": expanded_bytes,
        }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("package", type=Path, help="submission ZIP to inspect")
    parser.add_argument("--structure-only", action="store_true",
                        help="skip ffprobe/ffmpeg media checks; server media admission checks still apply")
    args = parser.parse_args()
    try:
        result = validate(args.package, inspect_media=not args.structure_only)
    except (ValueError, KeyError, OSError, zipfile.BadZipFile) as error:
        parser.exit(1, f"Template validation failed: {error}\n")
    print(json.dumps(result, indent=2))
    print("Template validation passed. The evaluation service performs additional private admission and benchmark checks after upload, including authoritative test-set coverage and full-frame alignment.")


if __name__ == "__main__":
    main()
