/* WorldOracle client-side language switcher. English remains the source text. */
(() => {
  'use strict';

  // Version the preference key so clients that visited the pre-launch Chinese
  // build start from the new English default once, then keep future choices.
  const STORAGE_KEY = 'worldoracle-language-v2';
  const COOKIE_KEY = 'worldoracle-language-v2';
  const ZH = 'zh-CN';
  const EN = 'en';
  const textOriginals = new WeakMap();
  const attributeOriginals = new WeakMap();

  // Keep this dictionary keyed by the English source so static templates and
  // dynamically rendered rows share exactly the same translations.
  const zh = {
    'Skip to Content': '跳至正文', 'Skip to Leaderboard': '跳至排行榜',
    'Primary Navigation': '主导航', 'Mobile Navigation': '移动端导航', 'Open Navigation': '打开导航',
    'Release Resources': '发布资源', 'Evaluation Platform': '评测平台', 'Leaderboard Tracks': '排行榜赛道',
    'Organizer Navigation': '组织者导航', 'Guide Sections': '指南章节',
    'Project Page': '项目主页', 'Leaderboard': '排行榜', 'Overview': '概览', 'Framework': '评测框架',
    'Ground Truth': '真实数据', 'Outcomes': '结果表现', 'Metrics': '评测指标',
    'Submission ↗': '提交入口 ↗', 'Coverage': '覆盖范围',
    'Guide': '指南', 'My Submissions': '我的提交', 'Request Access': '申请访问',
    'Sign In ↗': '登录 ↗', 'Sign In': '登录', 'Personal Center ↗': '个人中心 ↗',
    'Personal Center': '个人中心', 'Logout ↗': '退出登录 ↗', 'Logout →': '退出登录 →',
    'Logout': '退出登录', 'Change Password': '修改密码', 'Change Password →': '修改密码 →',
    'Action-Conditioned World Model Benchmark': '动作条件世界模型基准',
    'Benchmarking Action-Conditioned': '评测动作条件',
    'World Models against Real-World': '世界模型与真实世界',
    'Executions': '执行结果的一致性',
    'A real-world benchmark for testing whether predicted futures remain coherent with the actions that produce them.': '一个用于检验预测未来是否与产生它们的动作保持一致的真实世界基准。',
    'Paper': '论文', 'Code': '代码', 'Dataset': '数据集', 'Coming Soon': '即将发布',
    'Paper is coming soon.': '论文即将发布。', 'Code is coming soon.': '代码即将发布。', 'Dataset is coming soon.': '数据集即将发布。',
    'Dual-Arm Robot': '双臂机器人', 'Bimanual Platform': '双手操作平台', 'Human Hand': '人手',
    'Egocentric Manipulation': '第一视角操作', 'Demo Scores': '演示分数', 'Best Results': '最佳结果',
    'Model Metric Comparison': '模型指标对比',
    'Click any model to activate.': '点击任意模型以激活。', '(activated)': '（已激活）',
    "Sampled episode from this model's evaluation materials.": '该片段取样自此模型的评测材料。',
    'Video progress': '视频进度',
    'Four diagnostic metrics. Initial scores are illustrative. Unavailable MVAC is plotted at zero, not a measured zero.': '四项诊断指标。初始分数仅用于演示；不可用的 MVAC 以零绘制，并非实测零分。',
    'Four diagnostic metrics: PSC, KIAF, ISA and MVAC. Unavailable MVAC is plotted at zero, not a measured zero.': '四项诊断指标：PSC、KIAF、ISA 和 MVAC。不可用的 MVAC 以零绘制，并非实测零分。',
    'Click a model to highlight its profile. Click again to show all.': '点击模型以突出显示其轮廓；再次点击可显示全部模型。',
    'Click a model in the table to highlight its radar profile. Click again to show all. All scores are Demo.': '点击表格中的模型以突出其雷达图；再次点击可显示全部模型。所有分数均为演示数据。',
    'Click a model in the table to highlight its radar profile. Click again to show all.': '点击表格中的模型以突出其雷达图；再次点击可显示全部模型。',
    'Scores for the selected platform and duration': '所选平台和时长的分数',
    'Rank': '排名', 'Model': '模型', 'Score': '得分', 'Policy': '策略',
    'Model Info': '模型信息', 'Overall': '综合分数', 'Diagnostics': '分项指标', 'Evidence': '公开信息',
    'View': '视角', 'SV Score': '单视角分数', 'MV Score': '多视角分数', 'Resources': '公开资源', 'Updated': '更新时间',
    'Weights': '权重', 'Public': '有公开资源',
    'Single-View Score': '单视角分数', 'Multi-View Score': '多视角分数',
    'Physical Outcome': '物理结果', 'Key-Region Quality': '关键区域质量',
    'Interaction Alignment': '交互对齐', 'Multi-View Consistency': '多视角一致性',
    'Policy Evaluation': '策略评测', 'Policy Usefulness': '策略有效性',
    'Task Outcome': '任务结果', 'Visual Fidelity': '视觉保真度', 'Action Response': '动作响应',
    'View Robustness': '视角鲁棒性', 'Closed Loop': '闭环',
    'Multi-View · Demo': '多视角 · 演示', 'Single-View · Demo': '单视角 · 演示',
    'Single-View · Layout Demo': '单视角 · 布局演示',
    'No published model results for this platform and duration yet.': '该平台和时长暂未发布模型结果。',
    'Scoring & Data Notes': '评分与数据说明',
    'Single-View Score is the mean of PSC, KIAF and ISA. Multi-View Score adds MVAC with equal weight and is shown only for three-view submissions. A dash means unsupported, not evaluated or awaiting results. Trophies rank each numeric column independently; missing scores are excluded.': '单视角分数为 PSC、KIAF 与 ISA 的平均值。多视角分数在此基础上等权加入 MVAC，仅对三视角提交显示。“-”表示不支持、未评测或等待结果。奖杯按各数值列独立排名，缺失分数不参与排名。',
    'Score = mean of PO, KRO and IA, shared by all models. MVC and Policy are reported separately; “-” means unsupported, not evaluated or awaiting results and is plotted as 0 for display only. This is not a finalized overall-score protocol. Trophies rank each numeric column independently within the selected platform. Ties at the displayed precision share a rank; missing scores are excluded.': '得分为 PO、KRO 与 IA 的平均值，适用于所有模型。MVC 和策略评测单独报告；“-”表示不支持、未评测或等待结果，展示时按 0 绘制。本规则尚非最终综合评分协议。奖杯按所选平台内每个数值列独立排名；显示精度相同者并列，缺失分数不参与排名。',
    'All scores are illustrative, not benchmark measurements. Platform availability follows existing result artifacts; view labels describe evaluated outputs, not every capability of a model.': '所有分数仅为示例，并非基准实测结果。平台可用性依照现有结果产物；视角标签描述已评测输出，并不代表模型的全部能力。',
    'Full Leaderboard': '完整排行榜', 'Submission Guide': '提交指南',
    'Enable JavaScript to switch platforms and highlight radar profiles. Homepage scores use the 30s track.': '请启用 JavaScript 以切换平台和突出雷达图。主页分数使用 30 秒赛道。',
    'WorldOracle evaluates action-conditioned world models against paired real-world executions. Given the same initial observation and low-level action sequence, it asks whether a predicted rollout reproduces the real physical consequences and task-state transitions. The benchmark measures physical state correctness, interaction spatial alignment, key interaction area fidelity, and multi-view action coherence across different interaction dynamics and embodiments. Its evaluation suite includes long, multi-segment episodes with both successful and failed executions, revealing distinct model strengths and failure modes across varied action outcomes and behavior distributions.': 'WorldOracle 面向配对的真实世界执行评测动作条件世界模型。在相同的初始观测和低层动作序列下，它检验预测轨迹能否复现真实的物理后果与任务状态转移。基准从物理状态正确性、交互空间对齐、关键交互区域保真度和多视角动作一致性四个互补维度进行衡量，并覆盖不同交互动力学与具身形态。其评测集包含成功与失败执行的长时多片段轨迹，可在多种动作结果和行为分布下揭示模型的不同优势与失效模式。',
    'WorldOracle evaluates ACWMs against paired real-world executions from two data distributions: human-operated trajectories and policy rollouts collected on a real robot. For both distributions, each recorded action trajectory is replayed by the ACWM and compared with its paired real execution.': 'WorldOracle 使用两种数据分布中的配对真实世界执行评测 ACWM：人工操作轨迹，以及在真实机器人上采集的策略轨迹。对于两种分布，每条已记录的动作轨迹都由 ACWM 重放，并与其配对的真实执行进行比较。',
    'Real-World Ground Truth': '真实世界真值', 'Four Interactions with Distinct Dynamics.': '四类具有不同动力学特征的交互。',
    'Every reference is a recorded physical rollout—not a simulator-rendered target. Paired executions preserve both successful and failed outcomes across rigid, deformable, fluid, and articulated-object interactions.': '每条参考数据都是记录的真实物理轨迹，而非仿真器渲染目标。配对执行保留了刚体、可变形体、流体和关节物体交互中的成功与失败结果。',
    'Real GT · Top View': '真实 GT · 顶视图', 'Pick Fruit': '摘水果', 'Hang Towel': '挂毛巾', 'Pour Water': '倒水', 'Pull Drawer': '拉抽屉',
    'Validation · ep000014 · Top View': '验证集 · ep000014 · 顶视图', 'Validation · ep000018 · Top View': '验证集 · ep000018 · 顶视图',
    'Validation · ep000005 · Top View': '验证集 · ep000005 · 顶视图', 'Validation · ep000026 · Top View': '验证集 · ep000026 · 顶视图',
    'Rigid-Body Manipulation': '刚体操作', 'Deformable-Object Interaction': '可变形物体交互', 'Fluid Interaction': '流体交互', 'Articulated-Object Interaction': '关节物体交互',
    'Embodiments': '具身形态', 'Three Embodiments, One Evaluation Framework.': '三种具身形态，一套评测框架。',
    'WorldOracle evaluates heterogeneous agents and action spaces across human-operated and policy-rollout distributions using paired real-world execution references.': 'WorldOracle 使用配对的真实世界执行作为参考，评测人工操作与策略轨迹分布中的异构智能体和动作空间。',
    'Real Rollout': '真实轨迹', 'Validation Rollout': '验证集轨迹', 'Validation GT · ep000014 · Top View': '验证集 GT · ep000014 · 顶视图', 'Synchronized Multi-View Rollout': '同步多视角轨迹', 'Real-World Bimanual Manipulation': '真实世界双手操作',
    'Initial Observation': '初始观测', 'Bimanual Initial Observation': '双手初始观测',
    'Human Hand Validation Rollout, Hang Towel episode ep000002': 'Human Hand 验证集轨迹：挂毛巾 ep000002',
    'Validation GT · Hang Towel · ep000002 · Egocentric View': '验证集 GT · 挂毛巾 · ep000002 · 第一人称视角',
    'Success and Failure': '成功与失败', 'Real Actions. Different Outcomes.': '真实动作，不同结果。',
    'Real-world data includes both successful actions and failed attempts. Explore recorded GT excerpts from four tasks—capturing not only what works, but also missed grasps, dropped objects, and spills.': '真实世界数据同时包含成功动作和失败尝试。可查看四项任务的记录 GT 片段——不仅呈现成功，也包含抓取失误、物体掉落和液体洒出。',
    'Success': '成功', 'Failure': '失败', 'Fruit in the Basket': '水果落入篮中', 'Missed Grasp': '抓取失误',
    'The mango is placed in the basket and remains inside.': '芒果被放入篮中并保持在篮内。',
    'The gripper withdraws while the mango remains in the basket.': '夹爪收回，而芒果仍留在篮中。',
    'Towel on the Rail': '毛巾挂在杆上', 'Dropped Towel': '毛巾掉落', 'Water into the Cup': '水倒入杯中', 'Spilled Water': '水洒出',
    'Drawer Pulled Open': '抽屉被拉开', 'Missed Handle': '错过把手',
    'AgiBot G2 · Recorded action excerpts, not whole-episode labels. The two clips show separate attempts and are not time-aligned.': 'AgiBot G2 · 记录的动作片段，并非完整轨迹标签。两个片段展示独立尝试，时间并未对齐。',
    'Showing Pick Fruit success and failure excerpts.': '正在显示“摘水果”的成功与失败片段。',
    'Evaluation Directions and Scoring Logic.': '评测方向与评分逻辑。',
    'WorldOracle measures execution coherence along four complementary dimensions. The first three use the primary top-head view; multi-view action coherence uses all three synchronized views.': 'WorldOracle 从四个互补维度衡量执行一致性。前三项使用主顶视图，多视角动作一致性使用全部三个同步视角。',
    'Outcome State': '结果状态', 'Physical State Correctness': '物理状态正确性',
    'At each interaction segment’s outcome keyframe, a VLM judges physical-state criteria annotated from the paired real-world keyframe. Criterion scores are averaged within segments and then across the episode.': '在每个交互片段的结果关键帧，VLM 判断由配对真实世界关键帧标注的物理状态条件。条件得分先在片段内平均，再在整条轨迹中平均。',
    'Criteria → Segment Score → Episode Average': '条件判断 → 片段得分 → 轨迹平均',
    'Spatial Correspondence': '空间对应', 'Interaction Spatial Alignment': '交互空间对齐',
    'At sampled frames, DINOv3 features inside annotated object and arm or hand masks are matched between real and predicted observations. Spatial displacement and correspondence confidence reward action-relevant entities near their real positions.': '在采样帧上，真实观测与预测观测之间会匹配标注物体及机械臂或手部掩码内的 DINOv3 特征。空间位移与对应置信度共同衡量动作相关实体是否接近其真实位置。',
    'Masked Features → Spatial Matches → Temporal Average': '掩码特征 → 空间匹配 → 时间平均',
    'Local Appearance': '局部外观', 'Key Interaction Area Fidelity': '关键交互区域保真度',
    'Within masked regions of manipulated objects and robot arms or hands, PSNR, LPIPS, and V-JEPA measure pixel, perceptual, and semantic fidelity. Their normalized scores are combined geometrically, so one severe local error lowers the result.': '在被操作物体与机械臂或手部的掩码区域内，PSNR、LPIPS 和 V-JEPA 分别衡量像素级、感知级和语义级保真度。归一化得分通过几何平均组合，因此任一严重局部错误都会降低结果。',
    'Interaction Crops → PSNR / LPIPS / V-JEPA → Geometric Mean': '交互区域裁剪 → PSNR / LPIPS / V-JEPA → 几何平均',
    'Synchronized Views': '同步视角', 'Multi-View Action Coherence': '多视角动作一致性',
    'Robot-arm alignment is measured independently against the paired real execution in synchronized top, left-hand, and right-hand views, then aggregated. A frame scores highly only when motion is aligned in every view.': '分别在同步的顶视、左手和右手视角中，根据配对真实执行测量机械臂对齐情况，再进行聚合。只有动作在每个视角中都正确对齐时，该帧才会获得高分。',
    'Per-View Arm Alignment → Cross-View Average → Episode Average': '逐视角机械臂对齐 → 跨视角平均 → 轨迹平均',
    'Benchmark Coverage': '基准覆盖范围', 'One Benchmark, Multiple Worlds.': '一个基准，多个世界。',
    'Data Distributions': '数据分布', 'Human-Operated': '人工操作', 'Policy-Rollout': '策略轨迹', 'Models Studied': '已研究模型',
    'Benchmarking action-conditioned world models against real-world executions.': '评测动作条件世界模型与真实世界执行的一致性。',
    'Research Preview · 2026': '研究预览 · 2026',
    'WorldOracle Benchmark Registry': 'WorldOracle 基准结果库',
    'Verified held-out test results': '已核验的保留测试集结果',
    'WorldOracle Updates': 'WorldOracle 最新动态',
    'Updated 2026.10.16 · AoE': '更新于 2026.10.16 · AoE',
    'Latest benchmark releases and result updates.': '基准发布与结果更新。',
    'Benchmark updates, without the noise.': '只看重要的基准更新。',
    'Benchmark update history': '基准更新记录',
    'WorldOracle release news': 'WorldOracle 发布动态',
    'WorldOracle platform preview released': 'WorldOracle 平台预览版发布',
    'The project page and three public leaderboard tracks are now available.': '项目主页与三条公开排行榜赛道现已上线。',
    'Submission portal opened': '评测提交平台开放',
    'Registration and benchmark submission are now available to participating teams.': '参评团队现可注册账号并提交评测。',
    'Five baseline models added': '新增五个基线模型',
    'GE-Sim 2.0, Cosmos 3, DreamDojo, Ctrl-World and IRASim are now listed.': 'GE-Sim 2.0、Cosmos 3、DreamDojo、Ctrl-World 与 IRASim 现已列入榜单。',
    'Scroll / drag': '滚动 / 拖动',
    'Results refreshed': '结果已更新',
    'Verified scores are live across all three tracks.': '三条赛道的核验分数均已上线。',
    'Resources verified': '资源已核验',
    'Certification and public-resource status updated.': '认证与公开资源状态已更新。',
    'AoE dates aligned': 'AoE 日期已统一',
    'Every result now uses one publication timezone.': '所有结果统一使用同一发布时间区。',
    'One reporting format': '统一结果格式',
    'Main, Policy and Long-Horizon results now align.': '主赛道、策略赛道与长时程赛道现已统一。',
    'Metric sorting added': '新增指标排序',
    'Rank models by any published evaluation dimension.': '可按任一公开评测维度排列模型。',
    'Matched previews': '固定样例预览',
    'Compare models on the same held-out episode.': '在相同保留集 episode 上对比模型。',
    'Contributors published': '贡献团队已公开',
    'Every leaderboard entry now identifies its team.': '每条榜单结果均标明所属团队。',
    'Submissions opened': '提交已开放',
    'Account registration and evaluation are available.': '账号注册与评测流程现已可用。',
    'Three tracks online': '三条赛道上线',
    'Short, policy and complete-episode evaluation.': '覆盖短时、策略与完整 episode 评测。',
    'Bilingual navigation': '双语导航',
    'Project and submission pages now switch together.': '项目页与提交页现已同步切换语言。',
    'Submit': '提交',
    'Leaders': '领先模型', 'Current Leaders': '当前领先模型', 'Ranked by SV Score': '按单视角总分排名', 'Track Leaders': '赛道领先模型',
    'Ranking Preview': '排名预览', 'Preview ranking metric': '预览排名指标',
    'Track and platform Top 3 carousel': '赛道与平台前三名轮播', 'Top 3': '前三名',
    'Not yet ranked': '暂无排名', 'Awaiting a published result': '等待公开评测结果',
    'Previous ranking preview': '上一个排名预览', 'Next ranking preview': '下一个排名预览',
    'AgiBot G2 · SV Score': 'AgiBot G2 · 单视角分数',
    'Main': '主赛道', 'Policy': '策略赛道', 'Long': '长时程',
    'Refresh verified held-out results and public-resource status across the leaderboard.': '更新榜单中的已核验保留集结果与公开资源状态。',
    'Publish Policy Track and Long-Horizon Track results under the unified reporting format.': '以统一报告格式发布策略赛道与长时程赛道结果。',
    'Open the public submission-account and evaluation workflow.': '开放公开提交账号与评测流程。',
    'Leaderboard Highlights': '榜单亮点',
    'Current leaders': '当前领先模型',
    'AgiBot G2 · 30s evaluation': 'AgiBot G2 · 30 秒评测',
    'AgiBot G2 · Policy rollout': 'AgiBot G2 · 策略轨迹',
    'AgiBot G2 · Complete episode': 'AgiBot G2 · 完整 episode',
    'News': '资讯', '& Recent Leaderboard Highlights': '与近期榜单亮点',
    'Release notes, current leaders and verified-resource updates from the WorldOracle benchmark registry.': '查看 WorldOracle 基准结果库的版本动态、当前领先模型与已核验公开资源更新。',
    'Recent leaderboard highlights': '近期排行榜亮点',
    'Release note': '版本动态',
    'Three evaluation tracks are now available.': '三条评测赛道现已开放。',
    'Compare short-horizon predictions, policy rollouts and complete episodes under one reporting format.': '使用统一的结果格式，对比短时预测、策略轨迹与完整 episode。',
    'Explore the tracks': '查看各赛道',
    'Current leader': '当前领先模型',
    '73.20 SV Score · 79.30 MV Score on AgiBot G2 Main Track.': 'AgiBot G2 主赛道：单视角分数 73.20，多视角分数 79.30。',
    'Resource status': '资源状态',
    'Certified + public': '已认证且资源公开',
    'Five benchmark entries include verified public resources for follow-up and reproduction.': '五个基准条目包含已核验的公开资源，便于进一步研究与复现。',
    'Full': '完整',
    'Compare action-conditioned world models by how faithfully their predicted rollouts reproduce paired real-world executions under the same initial observation and low-level action trajectory.': '在相同初始观测和低层动作轨迹下，对比各动作条件世界模型的预测轨迹能否忠实复现配对的真实世界执行。',
    'Submit a model': '提交模型', 'Read the scoring guide': '查看评分说明',
    'Benchmark coverage': '基准覆盖范围', 'Action distributions': '动作分布', 'Evaluation dimensions': '评测维度',
    'AgiBot G2 · YAM · Human Hand': 'AgiBot G2 · YAM · Human Hand',
    'Human-operated · Policy-rollout': '人工操作 · 策略轨迹', 'Outcome · Alignment · Fidelity · Multi-view': '结果 · 对齐 · 保真度 · 多视角',
    'How to read the leaderboard': '如何阅读排行榜', 'Reading the board': '排行榜阅读指南',
    'Choose a track': '选择赛道', '30-second, policy-rollout, or complete-episode evaluation.': '选择 30 秒、策略轨迹或完整 episode 评测。',
    'Choose an embodiment': '选择具身形态', 'Compare models only within the same physical setting.': '只在相同物理平台内对比模型。',
    'Inspect the dimensions': '查看各项指标', 'Higher is better; unavailable multi-view results remain unranked.': '各项分数越高越好；无多视角结果时不参与该项排名。',
    'Open the matched episode': '查看固定对比 episode', 'The same held-out episode is shown for like-for-like visual comparison.': '同一赛道和平台统一展示相同的保留测试 episode，便于直观对比。',
    'Evaluation unit': '评测单元', 'Paired real execution': '配对真实执行',
    'Predictions and references share the same initial observation and action trajectory.': '预测与参考数据使用相同的初始观测和动作轨迹。',
    'Scoring reference': '评分说明', 'Execution coherence, resolved into four dimensions.': '从四个维度解析执行一致性。',
    'WorldOracle compares every prediction with its paired real-world rollout. The first three dimensions use the primary top_head view; multi-view action coherence uses all three synchronized views.': 'WorldOracle 将每条预测与其配对的真实世界轨迹进行比较。前三项指标使用主视角 top_head，多视角动作一致性使用三个同步视角。',
    '01 · Outcome state': '01 · 结果状态', '02 · Spatial correspondence': '02 · 空间对应', '03 · Local appearance': '03 · 局部外观', '04 · Synchronized views': '04 · 同步视角',
    'Checks whether predicted outcome keyframes satisfy the physical-state criteria annotated from the paired real execution.': '检查预测结果关键帧是否满足由配对真实执行标注的物理状态条件。',
    'Measures whether manipulated objects and robot arms or human hands remain aligned with their real-world trajectories.': '衡量被操作物体与机械臂或人手是否持续对齐其真实世界轨迹。',
    'Evaluates pixel, perceptual, and semantic fidelity inside action-relevant object and arm or hand regions.': '在动作相关的物体、机械臂或手部区域内评测像素、感知和语义保真度。',
    'Measures robot-execution alignment against the paired real rollout across synchronized top, left-hand, and right-hand views.': '在同步的顶视角、左手视角和右手视角中，衡量机器人执行与配对真实轨迹的对齐程度。',
    'Physical State Correctness + Interaction Spatial Alignment + Key Interaction Area Fidelity': '物理状态正确性 + 交互空间对齐 + 关键交互区域保真度',
    'WorldOracle-SV dimensions + Multi-View Action Coherence': 'WorldOracle-SV 三项指标 + 多视角动作一致性',
    'The Main Track evaluates the human-operated distribution over the first 30 seconds, using sampled frames and outcome keyframes from paired real-world executions.': '主赛道在人工操作分布上评测前 30 秒，使用配对真实世界执行中的采样帧和结果关键帧。',
    'The table reports Physical State Correctness (PSC), Key Interaction Area Fidelity (KIAF), Interaction Spatial Alignment (ISA), and Multi-View Action Coherence (MVAC, where supported). Single-View Score is the mean of PSC, KIAF and ISA. Multi-View Score adds MVAC with equal weight. A dash means unsupported or not evaluated.': '表格展示物理状态正确性（PSC）、关键交互区域保真度（KIAF）、交互空间对齐（ISA）和多视角动作一致性（MVAC，模型支持时）。单视角分数为 PSC、KIAF 和 ISA 的平均值，多视角分数再等权加入 MVAC。“-”表示不支持或未评测。',
    'All published values are held-out test-set results. Models are compared only within the same embodiment and temporal regime.': '所有已发布分数均来自保留测试集。模型只在相同具身形态和时间范围内进行比较。',
    'The Policy Track uses recorded action trajectories collected while a policy interacts with the physical AgiBot G2 robot in closed loop. During evaluation, each trajectory is replayed open loop by the ACWM and compared with its paired real execution.': '策略赛道使用策略与真实 AgiBot G2 机器人闭环交互时记录的动作轨迹。评测时，ACWM 开环重放每条轨迹，并与其配对的真实执行进行比较。',
    'The Long-Horizon Track evaluates every available frame and outcome keyframe in complete human-operated episodes, exposing how execution coherence changes as rollout errors accumulate.': '长时程赛道评测完整人工操作 episode 中所有可用帧和结果关键帧，用于观察预测误差累积时执行一致性的变化。',
    'Back to Project ↗': '返回项目主页 ↗', 'Track 1': '赛道 1', 'Track 2': '赛道 2', 'Track 3': '赛道 3',
    'Main Track': '主赛道', 'Policy Track': '策略赛道', 'Long-Horizon Track': '长时程赛道',
    '01 / Short-Horizon Prediction': '01 / 短时程预测', '02 / Action-Source Distribution': '02 / 动作来源分布', '03 / Long-Horizon Prediction': '03 / 长时程预测',
    'Evaluate the first 30 seconds against real-world executions using PO (Physical Outcome), KRO (Key-Region Quality), IA (Interaction Alignment), and MVC (Multi-View Consistency, where supported).': '使用 PO（物理结果）、KRO（关键区域质量）、IA（交互对齐）和 MVC（多视角一致性，视支持情况而定）评测前 30 秒与真实世界执行的一致性。',
    'Project Home': '项目主页',
    'Enable JavaScript to switch platforms and highlight radar profiles. The initial view shows the 30s track.': '请启用 JavaScript 以切换平台和突出雷达图。初始视图显示 30 秒赛道。',
    'Actions are collected while a policy interacts with the real robot, then replayed by the world model. This distribution is evaluated using KRO (Key-Region Quality), IA (Interaction Alignment), and MVC (Multi-View Consistency, only for supported outputs).': '在策略与真实机器人交互时采集动作，再由世界模型回放。该分布使用 KRO（关键区域质量）、IA（交互对齐）和 MVC（多视角一致性，仅适用于支持的输出）进行评测。',
    'Layout preview only: all values below are fictional, not measured Policy-rollout results or evidence of participation. MVC is shown only for models with multi-view outputs; “-” means not applicable and is plotted at zero on the radar only. These KRO / IA / MVC diagnostics are separate from the main board’s Policy Evaluation score.': '仅用于布局预览：以下所有数值均为虚构，并非策略轨迹实测结果或参与证明。MVC 仅展示给支持多视角输出的模型；“-”表示不适用，只会在雷达图中按零绘制。这些 KRO / IA / MVC 诊断指标独立于主榜的策略评测得分。',
    'Single-View Score is the mean of PSC, KIAF and ISA. Multi-View Score adds MVAC with equal weight and is shown only for three-view submissions. Each model keeps its best single-view result; a dash means not applicable.': '单视角分数为 PSC、KIAF 与 ISA 的平均值。多视角分数在此基础上等权加入 MVAC，仅对三视角提交显示。每个模型保留最佳单视角结果；“-”表示不适用。',
    'All table values are fictional layout examples. Enable JavaScript to view the radar chart.': '表中所有数值均为虚构的布局示例。请启用 JavaScript 查看雷达图。',
    'Compare longer predicted trajectories against real-world executions using PO (Physical Outcome), KRO (Key-Region Quality), IA (Interaction Alignment), and MVC (Multi-View Consistency, where supported).': '使用 PO（物理结果）、KRO（关键区域质量）、IA（交互对齐）和 MVC（多视角一致性，视支持情况而定）比较更长的预测轨迹与真实世界执行。',
    'Preliminary long-horizon measurements. Duration assignment remains subject to organizer confirmation.': '初步的长时程测量结果。时长归类仍待组织者确认。',
    'Enable JavaScript to load long-horizon results.': '请启用 JavaScript 加载长时程结果。',
    'Enable JavaScript to switch platforms and highlight radar profiles. This board shows long-horizon results.': '请启用 JavaScript 以切换平台和突出雷达图。本榜单显示长时程结果。',

    'Submission': '提交', 'Research Submission Portal': '研究提交门户', 'Submission Portal': '提交平台',
    'Secure Submission Portal': '安全提交平台', 'Welcome back.': '欢迎回来。',
    'Continue your evaluation.': '继续完成评测。', 'Registered Email': '注册邮箱',
    'Sign in with the verified email and password used for this registered model.': '请使用该模型账号已验证的邮箱和密码登录。',
    'The interface stays on GitHub Pages. Your credentials are sent only to the WorldOracle evaluation API over HTTPS and are never stored by GitHub Pages.': '页面始终由 GitHub Pages 提供。登录信息仅通过 HTTPS 发送至 WorldOracle 评测接口，不会存储在 GitHub Pages。',
    'Need an account? Register →': '还没有账号？立即注册 →', 'Register →': '注册 →', 'Sign Out': '退出登录', 'Profile': '账号信息',
    'Loading account…': '正在加载账号…', 'Loading submission access…': '正在加载提交权限…',
    'Loading submissions…': '正在加载提交记录…', 'Loading submission…': '正在加载提交…',
    'Current Stage': '当前阶段', 'Delete Draft': '删除草稿', 'Registered Model': '注册模型',
    'Private workspace': '私有工作区', 'Prepare Your': '准备您的', 'Submission.': '提交。',
    'Automatic Local Evaluation · Organizer Review Before Publication': '自动本地评测 · 发布前需组织者审核',
    'Account Application': '账户申请', 'Join the': '加入', 'Evaluation.': '评测。',
    'Tell us who you are and what you would like to evaluate.': '请告诉我们您的身份以及希望评测的内容。',
    'Accounts are manually approved. The organizers assign a username and initial password and send them to your contact email. Change the initial password on first sign-in.': '账户由人工审核。组织者会分配用户名和初始密码，并发送到您的联系邮箱。首次登录时请修改初始密码。',
    'Read the Access Guide ↗': '阅读访问指南 ↗', 'Full Name': '姓名', 'Institution or Team': '机构或团队',
    'Contact Email': '联系邮箱', 'Project and Intended Track': '项目与计划赛道',
    'Model name, project link, intended track and embodiment': '模型名称、项目链接、计划赛道和具身形态',
    'I agree that the organizers may store these details and use them to process my access request.': '我同意组织者存储这些信息，并用于处理我的访问申请。',
    'Send Access Request ↗': '发送访问申请 ↗',
    'This form saves your application. When SMTP is configured, it also notifies the responsible organizer by email.': '此表单会保存您的申请。配置 SMTP 后，也会通过邮件通知负责的组织者。',
    'The official contact email is pending configuration.': '官方联系邮箱尚待配置。', 'Contact:': '联系方式：',
    'Invitation Accepted': '已接受邀请', 'Set Your': '设置您的', 'Password.': '密码。',
    'Password': '密码', 'Confirm Password': '确认密码', 'Use at least 12 characters. Your invitation can be used only once.': '请使用至少 12 个字符。邀请链接仅能使用一次。',
    'Activate Account →': '激活账户 →', 'Account Security': '账户安全', 'Change Your': '修改您的',
    'Please replace your official initial password before continuing.': '请先替换官方初始密码，然后再继续。',
    'Official Username': '官方用户名', 'Current Password': '当前密码', 'New Password': '新密码', 'Confirm New Password': '确认新密码',
    'Use 12–256 characters. Your current password is required. Changing it signs out all previous sessions.': '请使用 12–256 个字符。必须提供当前密码；修改密码会退出所有已有会话。', 'Update Password →': '更新密码 →',
    'My': '我的', 'Submissions.': '提交。', '+ New Submission': '+ 新建提交',
    'Supported AgiBot G2 submissions are evaluated automatically with local metrics. Results remain private until organizer review; leaderboard publication is never automatic.': '受支持的 AgiBot G2 提交会自动运行本地指标评测。结果在组织者审核前保持私有，排行榜绝不会自动发布。',
    'Every formal submission receives a Track-specific submission number. A V number is assigned only after all required metrics pass; an improved score updates the model\'s best leaderboard result automatically.': '每次正式提交都会获得对应赛道的提交序号。只有全部必需指标通过后才会分配 V 版本号；成绩提升时会自动更新该模型的排行榜最佳结果。',
    'Untitled Draft': '未命名草稿', 'Embodiment Not Selected': '未选择具身形态', 'Continue Draft': '继续草稿', 'View Submission': '查看提交',
    'Your First Submission Starts Here.': '从这里开始您的首次提交。', 'Read the guide, create a draft, and save your progress one step at a time.': '阅读指南，创建草稿，然后逐步保存进度。', 'Explore the Package Format →': '查看提交包格式 →',
    'Delete this unsubmitted draft? It will disappear from your list. Organizers retain uploaded files and a recovery record.': '删除这份未提交草稿吗？它将从您的列表中消失。组织者会保留上传文件和恢复记录。', 'Delete Draft': '删除草稿',
    'Submission Details': '提交详情', 'Version': '版本', 'Successful Version': '成功版本', 'Track Submission': '赛道提交', 'No Successful Version': '暂无成功版本', 'Track': '赛道', 'Embodiment': '具身形态', 'Package': '提交包', 'Not Set': '未设置', 'Not Uploaded': '未上传',
    'Scores': '分数', 'Current Stage': '当前阶段', 'Evaluation Scores': '评测分数', 'Current Evaluation Stage': '当前评测阶段',
    'Submission Notes': '提交说明', 'No notes provided.': '未提供说明。', 'Edit Submission →': '编辑提交 →', 'Download Package': '下载提交包',
    'Supported AgiBot G2 submissions receive automatic local metric evaluation. Acceptance and leaderboard publication require separate organizer review.': '受支持的 AgiBot G2 提交会自动运行本地指标评测；接受与排行榜发布仍需组织者另行审核。',
    'Once all Track-required metrics pass, the submission receives its successful V number and can improve the model\'s leaderboard result automatically.': '当该赛道要求的全部指标通过后，提交会获得成功 V 版本号，并可自动更新模型的排行榜最佳成绩。',
    'Withdraw this submission? It will no longer be editable. Materials are retained for audit.': '撤回此提交吗？撤回后将不能编辑，材料仍会保留以供审计。', 'Withdraw Submission': '撤回提交', 'Review History': '审核历史',
    'Contribute to the Benchmark': '参与基准建设', 'Submission Guide.': '提交指南。',
    'From a real-world rollout to a reproducible result.': '从真实世界轨迹到可复现实验结果。', 'Prepare your materials, choose a track, and submit for review.': '准备材料，选择赛道，并提交审核。',
    'Submit Your Results ↗': '提交您的结果 ↗', 'Preview Protocol': '预览协议', 'One Framework.': '一套框架。', 'Three Evaluation Tracks.': '三条评测赛道。', 'Explore the Tracks ↓': '查看赛道 ↓',
    'Submission Process': '提交流程', 'Prepare Materials': '准备材料', 'Submit for Review': '提交审核', 'Follow Your Status': '跟踪状态',
    'On This Page': '本页内容', 'Guide Sections': '指南章节', 'Submission Overview': '提交概览', 'Choose a Track': '选择赛道', 'Prepare Your Submission': '准备提交', 'Validate and Submit': '验证与提交', 'Review and Publication': '审核与发布', 'Rules and FAQ': '规则与常见问题', 'Open Submission Portal ↗': '打开提交门户 ↗',
    'Get Started': '开始使用', 'Account Approval': '账户审核', 'Evaluation Tracks': '评测赛道', 'Package Specification': '提交包规范',
    'Model and Track': '模型与赛道', 'Upload Materials': '上传材料', 'Declarations': '声明', 'Review and Submit': '检查并提交',
    'Submission Steps': '提交步骤', 'Choose Your Benchmark Track': '选择您的基准赛道', 'Model Name': '模型名称', 'Assigned by Organizers': '由组织者指定', 'Submission Version': '提交版本', 'Automatic': '自动分配', 'Platform': '平台', 'Optional': '可选',
    'Upload Materials': '上传材料', 'Choose Your Package': '选择您的提交包', 'Ready': '就绪', 'Pause Upload': '暂停上传', 'Cancel Upload': '取消上传', 'Keep Current Package and Continue →': '保留当前提交包并继续 →',
    'Review and Submit': '检查并提交', 'Validation': '验证', 'Not Scored': '未评分', '← Back': '← 返回', 'Start Upload': '开始上传', 'Save and Continue →': '保存并继续 →',
    'Read the Submission Guide ↗': '阅读提交指南 ↗', 'Choose a Track in Step 1.': '请在第 1 步选择赛道。',
    'Main Track — Short-Horizon Prediction': '主赛道 — 短时程预测', 'Policy Track — Policy-Distribution Rollouts': '策略赛道 — 策略分布轨迹', 'Long-Horizon Track — Full-Trajectory Prediction': '长时程赛道 — 完整轨迹预测',
    '30s · Recorded Actions': '30 秒 · 记录动作', 'Policy Rollouts · AgiBot G2': '策略轨迹 · AgiBot G2', 'AgiBot G2 · Policy Rollouts': 'AgiBot G2 · 策略轨迹', 'Full Trajectories · Recorded Actions': '完整轨迹 · 记录动作',
    'Queued': '排队中', 'Submitted': '已提交', 'Under Review': '审核中', 'Needs Changes': '需要修改', 'Accepted': '已接受', 'Rejected': '已拒绝', 'Withdrawn': '已撤回', 'Draft': '草稿',

    'ORGANIZER WORKSPACE': '组织者工作区', 'MANAGEMENT': '管理', 'Evaluation Queue': '评测队列', 'History': '历史记录', 'Drafts': '草稿', 'Account Management': '账户管理', 'Compute Resources': '计算资源',
    'Private Workspace': '私有工作区', 'Restricted to official operators.': '仅限官方操作人员。', 'Changes are recorded for audit.': '所有更改都会记录以供审计。',
    '/ Operations': '/ 运营后台', 'Organizer Access Only': '仅限组织者访问', 'Private operations · Evaluation updates require an operator or trusted worker report.': '私有运营后台 · 评测更新需要操作人员或受信任工作进程上报。',
    'Live Operations': '实时运营', 'Evaluation': '评测', 'Queue.': '队列。', 'Waiting submissions and active evaluations, ordered by arrival.': '按提交先后显示等待中的提交与进行中的评测。', 'Refresh Queue ↻': '刷新队列 ↻',
    'Validated submissions move through the queue and publish a new model best automatically.': '已通过格式检查的提交会自动进入队列，并在完成后更新模型最佳成绩。',
    'Automatic Pipeline': '自动流程', 'Evaluation Flow': '评测流程', 'No Manual Approval': '无需人工审核',
    'Format Check': '格式审核', 'Queue Waiting': '队列等待', 'Metric Evaluation': '指标评测',
    'A completed score replaces the model\'s LeaderBoard result only when its overall score is higher. Every completed submission keeps its own score.': '只有当本次总分更高时，才会替换该模型在排行榜上的成绩；每次完成的提交都会保留自己的分数。',
    'Filter by Track': '按赛道筛选', 'Active metric evaluations': '正在运行的指标评测', 'Waiting for available compute': '等待可用计算资源',
    'Best Score Wins': '最佳分数优先', 'LeaderBoard updates automatically on improvement': '总分提高时自动更新排行榜',
    'Review by Track': '按赛道审核', 'All Tracks': '全部赛道', 'Legacy — Track Not Assigned': '旧版 — 未分配赛道', 'Filter Queue': '筛选队列',
    'Running': '运行中', 'Waiting': '等待中', 'Progress Source': '进度来源', 'Completion Rule': '完成规则', 'Metrics → Result': '指标 → 结果', 'All required metrics complete the run automatically': '全部必需指标完成后自动结束评测', 'Reported active evaluations': '已上报的活跃评测', 'Ready for an operator or worker': '等待操作人员或工作进程处理', 'Worker + Operator': 'Worker + 组织者', 'Automatic local evaluator with organizer review': '自动本地评测器 + 组织者审核',
    'Refreshes every 15 seconds while idle. Refresh pauses when you edit a form. Percentages refer to the current stage, not total runtime.': '空闲时每 15 秒刷新一次。编辑表单时暂停刷新。百分比表示当前阶段进度，而非总运行时间。',
    'Evaluation Queue': '评测队列', 'Waiting': '等待中', 'Running': '运行中', 'Submission Status': '提交状态', 'Submitter': '提交者', 'Run / Attempt': '运行 / 尝试', 'Last Report': '最后上报', 'Submission / Revision': '提交 / 修订',
    'Loading task resource usage…': '正在加载任务资源使用情况…', 'Update Stage': '更新阶段', 'Evaluation Stage': '评测阶段', 'Current Stage Progress (%)': '当前阶段进度（%）', 'Internal Progress Note': '内部进度说明',
    'Report completed work, errors, or why a metric is not applicable.': '说明已完成的工作、错误，或某项指标不适用的原因。', 'Measured Results (Optional JSON)': '测量结果（可选 JSON）', 'Record Update': '记录更新', 'View Full History ↗': '查看完整历史 ↗', 'Download Materials': '下载材料',
    'The Queue Is Clear': '队列已清空', 'New submissions appear here automatically. Only submitted packages enter this queue.': '新提交会自动出现在此处。只有已提交的包会进入该队列。',
    'New submissions appear here after their format check passes.': '新提交通过格式审核后会出现在这里。',
    'User': '用户', 'Submitted At': '提交时间', 'Last Update': '最近更新',
    'Loading live CPU, GPU and metric results…': '正在加载实时 CPU、GPU 和指标结果…',
    'CPU Cores': 'CPU 核数', 'Occupied GPUs': '占用 GPU', 'Completed Metric Averages': '已完成指标平均分',
    'Pending': '等待中', 'Checking': '检查中', 'Version Pending': '版本待定', 'GPU Cards': 'GPU 卡',
    'Finishing': '即将完成', 'Waiting for compute': '等待计算资源', 'No GPU process is currently attributed to this task.': '当前尚未检测到归属于此任务的 GPU 进程。',
    'Live Telemetry': '实时遥测', 'Compute': '计算', 'Resources.': '资源。', 'Refreshes every 5 seconds while this page is visible. Real measurements only; unavailable data is shown as N/A.': '本页可见时每 5 秒刷新一次。仅显示真实测量；不可用数据标为 N/A。', 'Read-Only': '只读',
    'Refreshes every second while this page is visible. Values update automatically.': '本页可见时每秒刷新，数据会自动更新。',
    'Host Capacity': '主机容量', 'Live': '实时', 'Server Overview': '服务器概览',
    'CPU Utilization': 'CPU 使用率', 'GPU Utilization': 'GPU 使用率', 'Memory Usage': '内存使用率', 'Disk Usage': '磁盘使用率', 'Accelerators': '加速卡',
    'Evaluation Runtime': '评测运行状态', 'Active Evaluation Tasks': '活跃评测任务', 'Current Stage': '当前阶段', 'Evaluation Progress': '评测进度',
    'CPU Usage': 'CPU 使用率', 'GPU Usage': 'GPU 使用率', 'Elapsed': '已耗时', 'Estimated Completion': '预计完成',
    'Successful Version Pending': '成功版本待定', 'Waiting for next stage': '等待下一阶段', 'Waiting for evaluator': '等待评测进程', 'Calculating…': '计算中…', 'Legacy Organizer Review': '旧版组织者审核',
    'No active evaluation tasks.': '当前没有活跃评测任务。', 'No active telemetry for this run.': '此评测暂无活跃资源数据。',
    'CPU model unavailable': 'CPU 型号不可用', 'No NVIDIA GPU detected.': '未检测到 NVIDIA GPU。',
    'CPU · Whole Host': 'CPU · 整台主机', 'Memory · Whole Host': '内存 · 整台主机', 'Disk · Submission Filesystem': '磁盘 · 提交文件系统', 'Loading…': '加载中…',
    'Per-task CPU uses cores (1.00 = one fully occupied logical CPU). Memory is summed process-tree RSS, which may double-count shared pages. GPU SM activity is per process when the driver supports it; it is not whole-device utilization. Disk counts the submitted ZIP and the run\'s managed working directory, excluding shared GT and model weights. Process-tree attribution does not include detached processes or remote API servers.': '每个任务的 CPU 以核心数表示（1.00 = 一个完全占用的逻辑 CPU）。内存为进程树 RSS 之和，可能会重复计算共享页。GPU SM 活动按进程统计（取决于驱动支持），并非整卡利用率。磁盘统计提交的 ZIP 与该运行受管工作目录，不含共享 GT 和模型权重。进程树归因不包含脱离的进程或远程 API 服务。',
    'Account Administration': '账户管理', 'Organizer Only': '仅限组织者', 'Administration.': '管理。', 'Create Ordinary Account →': '创建普通账户 →', 'Access Applications': '访问申请', 'Issued Accounts': '已发放账户', 'Email Delivery History': '邮件投递历史', 'No applications yet.': '暂无申请。', 'No emails attempted.': '尚未尝试发送邮件。', 'Retry Organizer Notification': '重试组织者通知', 'Create Account for Applicant': '为申请人创建账户',
    'Create Official Account': '创建官方账户', 'Organizer Only · Ordinary User': '仅限组织者 · 普通用户', 'Issue an': '发放一个', 'Account.': '账户。', 'Applicant Name': '申请人姓名', 'Delivery Email': '投递邮箱', 'Bound Model': '绑定模型', 'One model per account': '每个账户一个模型', 'Initial Password (Optional)': '初始密码（可选）', 'Create Ordinary Account →': '创建普通账户 →',
    'Account Information': '账户信息', 'Submission History': '提交历史', 'Account Type': '账户类型', 'Institution': '机构', 'Not Yet Assigned': '尚未分配', 'Organizer': '组织者', 'Ordinary User': '普通用户', 'Records': '条记录', 'No Submissions Yet.': '暂无提交。',
    'Account Created': '账户已创建', 'Created.': '已创建。', 'Delivery email:': '投递邮箱：', 'Username': '用户名', 'Initial Password': '初始密码', 'Role': '角色', 'Email Status': '邮件状态', 'This password is shown only in this response. Deliver it privately; do not refresh this POST or publish a screenshot. The recipient must change it on first sign-in.': '此密码只在当前响应中显示。请私下发送；不要刷新该 POST 页面或公开截图。接收者必须在首次登录时修改密码。', 'Back to Administration': '返回管理页',
    'Organizer Login': '组织者登录', 'Operations': '运营后台', 'Back to Submission Portal ↗': '返回提交门户 ↗',
    'Open Queue': '打开队列', 'Retry Evaluation': '重新评测', 'Record Decision': '记录决定', 'Review Decision': '审核决定', 'Request Changes': '请求修改', 'Reject Submission': '拒绝提交', 'Note Visible to the Submitter': '提交者可见的说明',
    'Completed': '已完成', 'Failed': '失败', 'Cancelled': '已取消', 'Preparing': '准备中', 'Validating': '验证中', 'Physical Evaluation': '物理结果评测', 'Spatial Evaluation': '空间评测', 'Key-Region Evaluation': '关键区域评测', 'Multi-View Evaluation': '多视角评测', 'Organizer Review': '组织者审核',

    // Homepage and full leaderboard details.
    'WorldOracle — Benchmarking Action-Conditioned World Models': 'WorldOracle — 动作条件世界模型基准评测',
    'Leaderboard Tracks · WorldOracle': '排行榜赛道 · WorldOracle', 'WorldOracle Home': 'WorldOracle 主页',
    '01 · DUAL-ARM ROBOT': '01 · 双臂机器人', '02 · BIMANUAL PLATFORM': '02 · 双手操作平台', '03 · EGOCENTRIC MANIPULATION': '03 · 第一视角操作',
    '01 · RIGID · AGIBOT G2 VALIDATION': '01 · 刚体 · AGIBOT G2 验证集', '02 · DEFORMABLE · AGIBOT G2 VALIDATION': '02 · 可变形体 · AGIBOT G2 验证集',
    '03 · FLUID · AGIBOT G2 VALIDATION': '03 · 流体 · AGIBOT G2 验证集', '04 · ARTICULATED · AGIBOT G2 VALIDATION': '04 · 关节物体 · AGIBOT G2 验证集',
    'AgiBot G2 Validation Rollout, episode ep000014': 'AgiBot G2 验证集轨迹，episode ep000014', 'YAM Real-World Rollout': 'YAM 真实世界轨迹',
    'Real-World Pick Fruit Validation Rollout, episode ep000014': '真实世界摘水果验证集轨迹，episode ep000014', 'Real-World Hang Towel Validation Rollout, episode ep000018': '真实世界挂毛巾验证集轨迹，episode ep000018',
    'Real-World Pour Water Validation Rollout, episode ep000005': '真实世界倒水验证集轨迹，episode ep000005', 'Real-World Pull Drawer Validation Rollout, episode ep000026': '真实世界拉抽屉验证集轨迹，episode ep000026',
    'Pick Fruit — Success GT Action Excerpt': '摘水果 — 成功 GT 动作片段', 'Pick Fruit — Failure GT Action Excerpt': '摘水果 — 失败 GT 动作片段',
    'Choose a Task': '选择任务', 'Evaluation Framework': '评测框架', 'Model Metric Scores': '模型指标分数',
    'Physical State Correctness ·': '物理状态正确性 ·', 'Key Interaction Area Fidelity ·': '关键交互区域保真度 ·',
    'Interaction Spatial Alignment ·': '交互空间对齐 ·', 'Multi-View Action Coherence ·': '多视角动作一致性 ·',
    'The towel stays draped over the rail after release.': '松开后，毛巾仍搭在横杆上。', 'The towel falls instead of remaining on the rail.': '毛巾掉落，未能留在横杆上。',
    'Water transfers into the receiving cup without a visible spill.': '水被倒入接收杯中，没有明显洒出。', 'Water spills across the table during the pouring attempt.': '倒水过程中，水洒到了桌面上。',
    'The gripper catches the handle and pulls the drawer open.': '夹爪抓住把手并拉开抽屉。', 'The gripper retracts and the drawer stays closed.': '夹爪收回，抽屉仍保持关闭。',
    'Long Horizon': '长时程', 'All models shown equally.': '所有模型均正常显示。',
    'Gold · 1st': '金牌 · 第 1 名', 'Silver · 2nd': '银牌 · 第 2 名', 'Bronze · 3rd': '铜牌 · 第 3 名',
    'Gold · 1st in this column': '本列金牌 · 第 1 名', 'Silver · 2nd in this column': '本列银牌 · 第 2 名', 'Bronze · 3rd in this column': '本列铜牌 · 第 3 名',
    'Unavailable (displayed at zero)': '不可用（仅在图中按零展示）', 'Not applicable (displayed at zero)': '不适用（仅在图中按零展示）',
    'Policy-Rollout Demo Radar': '策略轨迹演示雷达图',
    'Four metrics: PSC, KIAF, ISA and MVAC. Unsupported metrics are shown as dashes in the table and as zero on the radar only.': '四项指标：PSC、KIAF、ISA 和 MVAC。不支持的指标在表格中显示为“-”，仅在雷达图中按零展示。',
    'Demo scores are illustrative, not benchmark measurements. Platform availability follows existing result artifacts; view labels describe evaluated outputs, not every capability of a model.': '演示分数仅供说明，并非基准实测结果。平台可用性依据现有结果产物；视角标签描述已评测输出，并不代表模型的全部能力。',
    'Preliminary supplied results, provisionally assigned to Full Val pending duration confirmation.': '已提供的初步结果暂归入完整验证集，时长仍待确认。',
    'Verified held-out test-set retest results. Unavailable metrics are shown as dashes in the table and plotted at zero on the radar only.': '已核验的保留测试集重测结果。不可用的指标在表格中显示为“-”，仅在雷达图中按零绘制。',
    'Updated dates use Anywhere on Earth (AoE, UTC−12).': '更新时间采用全球最晚时区（AoE，UTC−12）。',
    'GE-Sim 2.0: local PO coverage is 1 task / 6 episodes.': 'GE-Sim 2.0：本地 PO 覆盖 1 个任务、6 条轨迹。',
    'YAM summaries cover 3 tasks / 75 episodes.': 'YAM 汇总覆盖 3 个任务、75 条轨迹。',
    'Policy is not part of this long-horizon board; unavailable MVC is plotted at zero only.': '此长时程榜单不含策略评测；不可用的 MVC 仅在图中按零展示。',
    'No verified model-result artifacts have been confirmed for this selection. Models are not included solely because the paper lists a planned experiment.': '当前选择下尚无经确认的模型结果产物。不会仅因论文列出计划实验就纳入模型。',
    'Score = mean of PO, KRO and IA, shared by all models. MVC is reported separately; “-” means unsupported, not evaluated or awaiting results and is plotted as 0 for display only. This is not a finalized overall-score protocol. Trophies rank each numeric column independently within the selected platform. Ties at the displayed precision share a rank; missing scores are excluded.': '得分为 PO、KRO 与 IA 的平均值，适用于所有模型。MVC 单独报告；“-”表示不支持、未评测或等待结果，展示时仅按零绘制。本规则尚非最终综合评分协议。奖杯按所选平台内每个数值列独立排名；显示精度相同者并列，缺失分数不参与排名。',
    'No published results for this platform and duration.': '该平台和时长暂无已发布结果。',

    // Submission guide and participant portal.
    '/ Submission': '/ 提交', 'WorldOracle · Research Submission Portal': 'WorldOracle · 研究提交门户',
    '01 / Get Started': '01 / 开始使用', '02 / Account Approval': '02 / 账户审核', '03 / Evaluation Tracks': '03 / 评测赛道',
    '04 / Package Specification': '04 / 提交包规范', '05 / Submission Wizard': '05 / 提交向导', '06 / What Happens Next': '06 / 后续流程', '07 / Fair and Reproducible': '07 / 公平与可复现',
    'Explore the Tracks': '查看赛道', 'Make Your Results Reproducible.': '让结果可复现。', 'Ready When You Are': '准备好即可开始',
    'Provide your name, institution or team, contact email, and a short description of your model and intended track. An institutional address is preferred. Please include a project or paper link when available.': '请提供姓名、机构或团队、联系邮箱，以及模型和计划赛道的简要说明。建议使用机构邮箱；如有项目或论文链接，也请一并提供。',
    'After approval, the organizers create an official username and initial password in their account administration console and send the credentials to your contact email.': '审核通过后，组织者会在账户管理后台创建官方用户名和初始密码，并将凭据发送到您的联系邮箱。',
    'The responsible organizer receives a notification email when delivery is configured, then reviews your affiliation and intended submission in the administration console.': '配置邮件投递后，负责的组织者会收到通知，并在管理后台审核您的机构信息和提交计划。',
    'Sign in with the official username (not your email). Replace the initial password on first sign-in. You can also open Change Your Password from the login page using your current password.': '请使用官方用户名（而非邮箱）登录，并在首次登录时更换初始密码。也可在登录页使用当前密码进入“修改密码”。',
    'WorldOracle uses one evaluation framework with open-loop and closed-loop protocols. The benchmark covers AgiBot G2, YAM, and human-hand embodiments. Choose Main, Policy, or Long-Horizon Track and submit prediction videos; no separate protocol selection is needed. Track availability does not imply an official test release or completed evaluation.': 'WorldOracle 在统一评测框架下包含开环和闭环协议，覆盖 AgiBot G2、YAM 和人手三种具身形态。请选择主赛道、策略赛道或长时程赛道并提交预测视频，无需另选协议。赛道可选并不代表官方测试集已发布或评测已完成。',
    'Each submission targets exactly one Track. Submit separately to enter more than one Track. Main and Long-Horizon accept prediction videos for AgiBot G2, YAM, or Human Hand. Policy Track currently covers AgiBot G2 policy-distribution rollouts.': '每次提交只对应一条赛道；如需参加多条赛道，请分别提交。主赛道和长时程赛道接受 AgiBot G2、YAM 或人手平台的预测视频；策略赛道目前仅覆盖 AgiBot G2 的策略分布轨迹。',
    'All three Tracks require prediction videos. Policy Track uses actions collected from real policy rollouts.': '三条赛道均需提交预测视频。策略赛道使用真实策略轨迹中采集的动作。',
    'Your model name is assigned by the organizers and is read-only. Choose your Track and platform, and optionally add submission notes. The server assigns V1, V2, and so on for each successful submission by your account, across all Tracks. Saving or deleting a draft does not consume a number; resubmitting requested changes receives a new number.': '模型名称由组织者指定且不可编辑。请选择赛道和平台，并可选填写提交说明。服务器会按账户跨赛道为每次成功提交依次分配 V1、V2 等版本号；保存或删除草稿不会占用编号，按修改要求重新提交会获得新编号。',
    'The following format is implemented by this portal. It is a proposed upload contract, not a claim that the benchmark\'s final release format is frozen.': '本门户已实现下述格式。它是拟定的上传约定，并不表示基准的最终发布格式已经冻结。',
    'Current upload limits: one ZIP per draft, up to 256 MiB total via resumable 8 MiB parts, up to 20,000 entries, and at most 2 GiB declared expanded size. Larger complete video packages need organizer coordination; do not reduce coverage or quality merely to fit the preview uploader. Videos are copied to private temporary files for bounded header and first-frame checks; uploaded code is never executed.': '当前上传限制：每份草稿一个 ZIP，总大小不超过 256 MiB，采用可续传的 8 MiB 分片；最多 20,000 个条目，声明的解压后大小最多 2 GiB。更大的完整视频包需要与组织者协调；不要仅为适配预览上传器而降低覆盖率或质量。视频会复制到私有临时文件中，仅做有界的文件头和首帧检查；上传的代码绝不会执行。',
    'For prediction-video packages, each manifest entry specifies': '对于预测视频包，每个 manifest 条目需指定',
    'Use MP4 files with H.264 video for compatibility. Explain the action-to-frame mapping, initial-frame inclusion, resolution, and any resampling in the README. Do not silently alter the requested trajectory or select only successful attempts.': '为保证兼容性，请使用包含 H.264 视频的 MP4 文件。在 README 中说明动作与帧的映射、是否包含初始帧、分辨率及任何重采样。不要擅自更改要求的轨迹或只选择成功样例。',
    'Use the same validation routine locally before uploading:': '上传前请在本地运行相同的验证流程：',
    'The validator ships with the submission portal source code; its standalone public distribution is pending.': '验证器随提交门户源代码提供，独立公开版本尚待发布。',
    'Track admission checks inspect video headers and decode the first frame, validate declared frame rates, view counts, synchronization, and Main Track’s 30-second limit. They do not decode every frame, verify the complete official episode list, assess data leakage, recompute metrics, or establish result validity. Those require further review and the released evaluation protocol.': '赛道接入检查会读取视频头并解码首帧，验证声明的帧率、视角数量、同步情况以及主赛道的 30 秒限制。它不会解码每一帧、核验完整官方轨迹清单、评估数据泄漏、重算指标或确认结果有效性；这些仍需进一步审核和正式发布的评测协议。',
    'An uploaded package is not yet a verified benchmark result. Supported AgiBot G2 submissions enter automatic local evaluation after submission; scores remain private until organizer review and are never published automatically.': '上传包尚不等于经过验证的基准结果。受支持的 AgiBot G2 提交在正式提交后会进入自动本地评测；分数在组织者审核前保持私有，且绝不会自动发布。',
    'Saved steps remain in your account. Incomplete uploads expire after 48 hours without a successful part. Replacing model metadata cancels outstanding uploads and resets the package association and declarations to prevent mismatched submissions. After final submission, the record is read-only unless the organizers request changes.': '已保存步骤会保留在账户中。若 48 小时内没有成功上传分片，未完成的上传将过期。更改模型元数据会取消未完成上传，并重置提交包关联和声明，以防信息不匹配。最终提交后记录将变为只读，除非组织者要求修改。',
    'Follow progress in': '请在', 'submission portal': '提交门户', 'check the summary and send it to the organizers.': '检查摘要并提交给组织者。',
    'Organizers review the selected Track, platform, trajectory horizon or policy distribution, coverage, and applicable metrics before accepting results. They can move a submitted record to Under Review, request changes, or accept or reject it with a visible review note.': '组织者会在接受结果前审核所选赛道、平台、轨迹时长或策略分布、覆盖范围及适用指标。他们可以将记录转为“审核中”、要求修改，或通过带有可见审核说明的方式接受或拒绝。',
    'Acceptance records the organizer\'s decision; it does not automatically publish results. Official scoring, verification badges, and leaderboard publication must be separately confirmed. No review deadline is promised during this preview.': '接受仅记录组织者的决定，不会自动发布结果。官方评分、验证标记和排行榜发布均需另行确认。预览阶段不承诺审核时限。',
    'If changes are requested, edit the existing submission and resubmit it. You can withdraw a nonfinalized submission. For accepted or rejected records, contact the organizers to request further changes or removal.': '如被要求修改，请编辑原提交并重新提交。尚未最终确定的提交可以撤回；如记录已接受或拒绝，请联系组织者申请进一步修改或移除。',
    'Researchers and model developers may request an account for their team. Both open-weight and closed-source approaches may be proposed; access and compatibility are reviewed by the organizers.': '研究人员和模型开发者可为团队申请账户。开放权重和闭源方案均可申请，访问权限与兼容性由组织者审核。',
    'Official evaluation quotas are not yet defined. Local abuse limits are currently 20 new drafts and 10 upload attempts per account per day; these are portal limits, not benchmark evaluation allowances. The server automatically numbers each successful submission for your account.': '官方评测配额尚未确定。当前本地防滥用限制为每个账户每天最多新建 20 份草稿、发起 10 次上传；这些是门户限制，并非基准评测额度。服务器会自动为账户的每次成功提交编号。',
    'No. All three Track forms require prediction-video artifacts. Self-reported numbers alone are insufficient for review.': '不可以。三条赛道均要求提供预测视频产物，仅提交自报数值不足以完成审核。',
    'Use N/A, with the reason and supported views. A missing or unsupported metric is not a measured zero. Never submit the homepage radar\'s illustrative Policy Evaluation values as experimental results.': '请填写 N/A，并说明原因和支持的视角。缺失或不支持的指标不等于实测零分。绝不要把主页雷达图中的策略评测演示值作为实验结果提交。',
    'No. Use this optional field for information you want the organizers to know about this submission, up to 4,000 characters.': '不需要。该字段为可选，可填写希望组织者了解的信息，最多 4,000 个字符。',
    'No. Account submissions and uploaded files are accessible only through owner-authenticated routes and organizer access to the server. Publication requires a separate decision. Drafts, replaced files, and withdrawn records remain on disk for audit; a final retention policy must be established before public launch.': '不会。账户提交和上传文件只能通过所有者身份验证后的路由或组织者服务器权限访问。发布需要单独决定。草稿、被替换文件和撤回记录会留存以供审计；公开上线前仍需确定最终保留策略。',
    'Can I submit repeatedly?': '可以重复提交吗？', 'Can I upload only my aggregate scores?': '可以只上传汇总分数吗？',
    'How should unavailable metrics be reported?': '不可用指标应如何填写？', 'Are submission notes required?': '提交说明是必填项吗？',
    'Are my files public?': '我的文件会公开吗？', 'Who can help with access or large uploads?': '访问或大文件上传问题可以联系谁？',
    'Model and Track:': '模型与赛道：', 'Upload Materials:': '上传材料：', 'Declarations:': '声明：', 'Review and Submit:': '检查并提交：',
    'A new number is assigned after each successful submission. Saving drafts does not consume a version.': '每次成功提交后都会分配新的编号；保存草稿不会占用版本号。',
    'Each account is bound to one model. Organizers confirm this name when issuing the account. Submission versions are assigned by the server, not entered by users.': '每个账户绑定一个模型。组织者在发放账户时确认模型名称；提交版本由服务器分配，无需用户填写。',
    'All three Tracks accept prediction videos. MVC applies only to multi-view outputs.': '三条赛道均接受预测视频；MVC 仅适用于多视角输出。',
    'Policy Track supports AgiBot G2 only.': '策略赛道仅支持 AgiBot G2。',
    'Files are hashed and sent in 16 MiB parts across up to 6 resumable lanes. After interruption, reselect the same ZIP to resume. Incomplete uploads expire after 48 hours of inactivity. Uploading does not submit your result.': '文件会在后台计算校验值，并以 16 MiB 分片通过最多 6 路并行可续传连接发送。中断后重新选择同一 ZIP 即可续传。未完成的上传在 48 小时无活动后过期；上传并不等于正式提交结果。',
    'Checking file identity before starting the resumable upload…': '正在确认文件身份并准备断点续传…',
    'A valid chunk checksum is required.': '每个分片都必须提供有效的校验值。',
    'The completed file identity does not match its verified chunks.': '完整文件身份与已验证分片不一致。',
    'The server runs the selected Track’s admission checks, including video headers and first-frame decoding in private temporary storage. Uploaded code is never executed. Passing checks allows final submission to enter the evaluation queue; it is not score verification.': '服务器会在私有临时存储中执行所选赛道的接入检查，包括视频头和首帧解码。上传代码绝不会执行。通过检查后，最终提交可以进入评测队列，但这并不代表分数已验证。',
    'Confirm these statements for the current package before submitting.': '提交前请确认当前提交包符合以下声明。',
    'Submission locks this record until the organizers request changes. No benchmark scores are generated at this step.': '提交后记录将被锁定，直至组织者要求修改。此步骤不会生成基准分数。',
    'Assigned after successful submission': '成功提交后分配', 'Confirmed upload progress': '已确认的上传进度',
    'Choose a Track and upload prediction videos. Policy Track uses actions collected from policy rollouts and supports AgiBot G2 only.': '请选择赛道并上传预测视频。策略赛道使用策略轨迹中采集的动作，且仅支持 AgiBot G2。',
    'Every submission stays tied to its account, model, Track, and automatically assigned version. Unsupported metrics are N/A, never fabricated zeros.': '每次提交始终与账户、模型、赛道及自动分配的版本绑定。不支持的指标应标为 N/A，绝不能伪造为零。',
    '← My Submissions': '← 我的提交', 'Back to Guide': '返回指南',
    'An official username and password are required. This is a real login, not a demo account or a browser-only session.': '需要官方用户名和密码。这是真实登录，不是演示账户或仅存在于浏览器中的会话。',
    'Prepare a draft, upload your materials, and follow the review.': '创建草稿、上传材料并跟踪审核进度。',
    'Need an account?': '需要账户？', 'Use the username assigned by the organizers, not your email address.': '请使用组织者分配的用户名，而不是邮箱地址。',
    'Change Your Password': '修改密码', 'using your current password. If you have forgotten it, contact the organizers.': '并使用当前密码。如已忘记密码，请联系组织者。',
    'One Workspace.': '一个工作区。', 'Your Work.': '管理您的工作。', 'Personal': '个人', 'Center.': '中心。',
    'Your account and submission history, in one place.': '在一个页面中查看账户和提交历史。', 'These details are assigned by the organizers and cannot be edited here.': '这些信息由组织者分配，无法在此编辑。',
    'Read-only records. Continue editing drafts from My Submissions, not from this page.': '以下记录为只读。请从“我的提交”继续编辑草稿，而不是在本页操作。',
    'Your saved drafts and submitted records will appear here.': '已保存草稿和已提交记录会显示在这里。',
    'Account Information': '账户信息', 'Account Type': '账户类型', 'Name': '姓名', 'Created (UTC)': '创建时间（UTC）', 'Updated (UTC)': '更新时间（UTC）', 'Submission ID': '提交 ID',

    // Organizer workspace.
    'Accounts': '账户', 'Evaluations': '评测', 'Every Evaluation.': '每次评测。', 'One Workspace.': '一个工作区。',
    'WorldOracle Operations': 'WorldOracle 运营后台', 'Organizer Sign In': '组织者登录', 'Restricted Access': '受限访问',
    'Manage research accounts, follow evaluation progress, and curate the published leaderboard.': '管理研究账户、跟踪评测进度并维护已发布排行榜。',
    'Use your official administrator credentials.': '请使用官方管理员凭据。', 'Participant accounts cannot access this workspace.': '参与者账户无法访问此工作区。',
    'Enter Workspace →': '进入工作区 →', 'Back to Submission Portal ↗': '返回提交门户 ↗',
    'Drafts.': '草稿。', 'Saved, Not Submitted': '已保存，未提交', 'Saved Progress': '已保存进度',
    'Saved participant work is kept here until submission. Drafts never enter the evaluation queue.': '参与者保存的工作会在此保留至正式提交。草稿绝不会进入评测队列。',
    'Search saved drafts': '搜索已保存草稿', 'Search model, account, or institution': '搜索模型、账户或机构', 'Search model or account': '搜索模型或账户', 'Search': '搜索', 'Clear': '清除',
    'Draft ID': '草稿 ID', 'Assign Account Model': '绑定账户模型', 'Confirm Model Binding': '确认模型绑定',
    'For legacy account reconciliation only. This binds future submissions without changing saved draft contents.': '仅用于旧账户协调。此操作会绑定未来提交，但不会更改已保存的草稿内容。',
    'Read-only organizer view. The participant can continue editing and submit when ready.': '组织者只读视图。参与者可以继续编辑，并在准备好后提交。',
    'No Saved Drafts': '没有已保存草稿', 'Unsubmitted drafts will appear here. Submitted records move to History automatically.': '未提交草稿会显示在这里；提交后记录会自动移入历史。',
    'Submitted Models': '已提交模型', 'History.': '历史记录。', 'Select a model to view its submissions, evaluation results, and review history.': '选择模型以查看其提交、评测结果和审核历史。',
    'Select a model and account to view its submission history in three separate Tracks.': '选择模型和账户，查看三个赛道分别维护的提交历史。', 'Across all Tracks': '所有赛道合计',
    'Model / Account': '模型 / 账户', 'Submissions': '提交', 'Latest Status': '最新状态', 'Latest Evaluation': '最新评测', 'Last Updated': '最后更新',
    'No Submitted Models': '暂无已提交模型', 'Unsubmitted work is kept separately in Drafts.': '未提交内容单独保存在草稿中。',
    '← History': '← 历史记录', 'Back to History': '返回历史记录', 'Bind This Account to a Model': '为此账户绑定模型',
    'Legacy records are preserved under their original names. This binding applies to all future submissions and cannot be changed here.': '旧记录会以原名称保留。此绑定适用于所有未来提交，且无法在此更改。',
    'No submissions yet.': '暂无提交。', 'No evaluation attempt has been recorded for this submission.': '此提交尚未记录任何评测尝试。',
    'Successful V numbers are maintained independently within each Track.': '成功版本号在每个赛道内独立维护。', 'Track Submissions': '赛道提交',
    'No submissions in this Track.': '此赛道暂无提交。', 'A user may choose to submit only to selected Tracks.': '用户可以只选择部分赛道提交。',
    'Submission Number': '赛道提交序号', 'Evaluation Status': '评测状态', 'Submitted At': '提交时间', 'Completed Metric Results': '已完成指标结果',
    'Successful Result': '成功版本结果', 'Evaluation Record': '评测记录', 'Package Checksum': '提交包校验值', 'Not Available': '暂无', 'Legacy Result': '旧版结果',
    'Final Score': '最终分数', 'Failure Reason': '失败原因', 'Download Original Input ZIP ↗': '下载原始输入 ZIP ↗', 'Original Input Unavailable': '原始输入不可用',
    'Legacy / Track Not Selected': '旧记录 / 未选择赛道', 'Older records without a Track are preserved here.': '未记录赛道的旧提交会保留在这里。',
    'No measured scores recorded for this attempt.': '本次尝试尚未记录实测分数。', 'Task resource usage is available while the run is active.': '运行处于活动状态时可查看任务资源使用情况。', 'Task resource usage is available while the evaluation is active.': '评测处于活动状态时可查看任务资源使用情况。',
    'Download Submitted Materials': '下载已提交材料', 'Open Queue': '打开队列', 'Retry Evaluation': '重新评测',
    'Demo · Fictional submissions and scores for layout review. No real evaluation or publication.': '演示 · 用于布局审核的虚构提交和分数，不代表真实评测或发布。',
    'Demo snapshot · Progress is fixed for layout review; editing is disabled.': '演示快照 · 进度固定用于布局审核，禁止编辑。',
    'Check the prescribed dataset, episode coverage, platform, views, horizon / policy-action distribution, alignment, and applicable metric results.': '检查规定的数据集、轨迹覆盖、平台、视角、时长或策略动作分布、对齐情况及适用指标结果。',
    'I have checked these requirements for this Track (required for Organizer Review and Completed).': '我已检查本赛道的这些要求（进入组织者审核和完成状态所必需）。',
    'Current stage progress': '当前阶段进度',
    'Add Leaderboard Entry': '添加排行榜条目', 'Management.': '管理。', 'Publication Control': '发布控制', 'Create Entry': '创建条目',
    'Only published, non-archived entries are public. Rankings are sorted by score automatically.': '仅已发布且未归档的条目对外公开；排名会按分数自动排序。',
    'Model Metric Scores': '模型指标分数', 'Platform / Duration': '平台 / 时长', 'Evaluated Views': '已评测视角', 'Duration': '时长',
    'Metrics [PO, KRO, IA, MVC, Policy]': '指标 [PO、KRO、IA、MVC、策略]', 'Radar Color': '雷达图颜色', 'Legacy Score (V2 Is Computed)': '旧版得分（V2 自动计算）',
    'Internal Source / Scoring Basis': '内部来源 / 评分依据', 'Publication Control': '发布控制', 'Publish on Project Homepage': '发布到项目主页',
    'Label as Demo': '标记为演示', 'Participated in Closed-Loop Policy Evaluation': '参加闭环策略评测', 'Save Changes': '保存更改', 'Edit ↘': '编辑 ↘', 'Manage': '管理',
    'Archived entries remain recoverable.': '已归档条目仍可恢复。', 'Recent Change History': '近期变更历史', 'No leaderboard edits yet.': '尚无排行榜编辑记录。',
    'V2 Score is computed from the first three metrics. Use null for unavailable MVC or Policy. Policy values require confirmed participation; do not infer this from multi-view support. V1 legacy entries are preserved but not displayed on the new leaderboard.': 'V2 得分由前三项指标计算。不可用的 MVC 或策略分数请填写 null。策略数值必须有已确认的参评记录，不能根据多视角支持情况推断。V1 旧条目会保留，但不在新排行榜中展示。',
    'Visibility': '可见性', 'Updated': '更新时间', 'Multi-View': '多视角', 'Single-View': '单视角',
    'Leave the password blank to generate a secure password. The initial password is shown once after creation and must be changed on first sign-in. It is never stored in plaintext.': '密码留空可自动生成安全密码。初始密码只在创建后显示一次，且必须在首次登录时修改；系统绝不会以明文存储。',
    'Send these initial credentials to the verified applicant email using configured SMTP. If unavailable, show Not Configured without claiming delivery.': '使用已配置的 SMTP 将初始凭据发送至经验证的申请人邮箱。如服务不可用，应显示“未配置”，不得声称已投递。',
    'No active real evaluation tasks. Demo rows do not consume evaluation resources.': '当前没有活跃的真实评测任务；演示行不会消耗评测资源。',
    'No active telemetry for this run (finished, cancelled, or no longer in the active queue).': '此运行没有活跃遥测数据（可能已完成、已取消或已不在活动队列中）。',
    'No NVIDIA GPU detected.': '未检测到 NVIDIA GPU。', 'Service container quota telemetry unavailable.': '服务容器配额遥测不可用。',
    'Evaluator process ended or unavailable': '评测进程已结束或不可用', 'Evaluator process not bound — live task attribution unavailable': '未绑定评测进程 — 无法提供实时任务归因',
    'GPU: N/A (no attributable GPU process reported)': 'GPU：N/A（未报告可归因的 GPU 进程）',
    'Auto-refresh paused while editing. Save or refresh to resume.': '编辑期间已暂停自动刷新；保存或刷新后恢复。',
    'Resource refresh failed — displayed measurements may be stale. Check the connection or sign in again.': '资源刷新失败 — 当前显示的测量值可能已过期。请检查连接或重新登录。',

    // Dynamic upload and form state.
    'Saving your submission…': '正在保存提交…', 'Uploading and checking the package. Please keep this page open…': '正在上传并检查提交包，请保持此页面打开…',
    'Checking Upload…': '正在检查上传…', 'Preparing Upload…': '正在准备上传…', 'Resume Upload': '继续上传', 'Retry Upload': '重试上传', 'Retry Upload / Check': '重试上传 / 检查',
    'Uploading…': '正在上传…', 'Upload Verified': '上传已验证', 'Upload verified. Opening declarations…': '上传已验证，正在打开声明页面…',
    'Checking file integrity and Track requirements… No evaluation has started.': '正在检查文件完整性和赛道要求…评测尚未开始。',
    'Upload received. Waiting for file assembly and Track checks… You may return to this draft later.': '上传已接收，正在等待文件合并和赛道检查…您可以稍后返回此草稿。',
    'Uploading verified parts. The next step remains locked until checks pass.': '正在上传已验证分片。检查通过前，下一步仍保持锁定。',
    'Choose the original ZIP file to start or resume.': '请选择原始 ZIP 文件以开始或继续上传。', 'Secure file hashing requires HTTPS or localhost.': '安全文件哈希需要 HTTPS 或 localhost。',
    'Upload ended. Choose the file to start a new upload.': '上传已结束。请选择文件开始新的上传。',
    'Upload paused. Received parts are saved; use Resume Upload to continue.': '上传已暂停。已接收的分片已保存；请使用“继续上传”恢复。',
    'Upload cancelled. Temporary parts will be cleaned automatically. Your draft is unchanged.': '上传已取消，临时分片将自动清理；草稿未被更改。',
    'Cancel this upload and schedule its temporary parts for removal? Your draft is kept.': '取消此次上传并安排删除临时分片吗？您的草稿会保留。',
    'Please sign in again and reopen this draft to resume.': '请重新登录并再次打开此草稿以继续。',
    'Sign in again, reopen your draft, and reselect the file to resume.': '请重新登录、再次打开草稿并重新选择文件以继续。',
    'Save your Track and platform before uploading.': '上传前请先保存赛道和平台。', 'Upload metadata must be a JSON object.': '上传元数据必须是 JSON 对象。',
    'File exceeds the configured total upload limit or is empty.': '文件为空或超过配置的总上传上限。', 'Choose a ZIP filename of at most 160 characters, without directory paths.': '请选择不含目录路径且不超过 160 个字符的 ZIP 文件名。',
    'Invalid part checksums.': '分片校验和无效。', 'Draft changed. Reload it before uploading.': '草稿已更改，请重新加载后再上传。',
    'Another file is attached to this upload. Cancel it before choosing a different file.': '此次上传已关联另一个文件，请先取消再选择其他文件。',
    'Upload quota reached. Cancel other uploads and wait for temporary-file cleanup.': '已达到上传配额。请取消其他上传，并等待临时文件清理。',
    'Not enough free storage to safely receive and assemble this upload.': '可用存储空间不足，无法安全接收并合并此次上传。',
    'Upload is no longer editable. Reload the draft.': '此次上传已不可编辑，请重新加载草稿。', 'Invalid part number.': '分片编号无效。',
    'Part length does not match the expected length.': '分片长度与预期不符。', 'Upload changed.': '上传状态已更改。', 'Draft changed during upload.': '上传期间草稿发生更改。',
    'Another part is being saved. Retry shortly.': '另一个分片正在保存，请稍后重试。', 'Upload is no longer editable.': '此次上传已不可编辑。',
    'Some parts are missing; resume the upload first.': '部分分片缺失，请先继续上传。', 'Completed files are retained. Start a new upload to replace this package.': '已完成文件会被保留。如需替换此提交包，请开始新的上传。',
    'Too many attempts. Please try again later.': '尝试次数过多，请稍后再试。', 'Your form has expired. Reload the page and try again.': '表单已过期，请重新加载页面后再试。',
    'Complete all fields and provide a valid email address.': '请填写所有字段并提供有效邮箱地址。', 'Confirm that the team may use your details to process this request.': '请确认团队可以使用您的信息处理此次申请。',
    'Use 12–256 characters and enter the same password twice.': '请使用 12–256 个字符，并两次输入相同密码。', 'Your password is set. You can now sign in.': '密码已设置，现在可以登录。',
    'Unable to sign in. Check your credentials and account activation.': '无法登录，请检查凭据和账户激活状态。', 'Unable to sign in. Check your official username and password.': '无法登录，请检查官方用户名和密码。',
    'Select and save your benchmark Track before continuing.': '继续前请选择并保存基准赛道。', 'Finish or cancel the pending upload before continuing to declarations.': '继续进入声明前，请完成或取消待处理的上传。',
    'Ask the organizers to bind a model to your account before submitting.': '提交前请联系组织者为账户绑定模型。', 'Submission notes must not exceed 4,000 characters.': '提交说明不得超过 4,000 个字符。',
    'Choose a ZIP package. See the preview format in the guide.': '请选择 ZIP 提交包，预览格式请参阅指南。', 'Please confirm all four declarations.': '请确认全部四项声明。',
    'Wait for your upload to finish checking, or cancel it, before submitting.': '提交前请等待上传检查完成，或取消上传。', 'Submission changed. Reload and review it again.': '提交已更改，请重新加载并再次检查。',
    'Draft deleted. Uploaded files and a private recovery record are retained by the organizers.': '草稿已删除。组织者会保留上传文件和私有恢复记录。',
    'Only drafts that have never been submitted can be deleted.': '只有从未正式提交的草稿可以删除。', 'This submission is finalized. Contact the organizers for further changes.': '此提交已最终确定，如需进一步修改请联系组织者。',
    'Request Not Completed': '请求未完成', 'Request Received': '申请已收到', 'Official Account Required': '需要官方账户'
  };

  Object.assign(zh, {
    'Recommended frame-to-video encoding': '建议的图片帧转视频编码方式',
    'Encode the original PNG sequence directly to the final MP4 once. Replace': '将原始 PNG 序列直接一次编码为最终 MP4。请将',
    'with the source sequence FPS and keep the same value in': '替换为源图片序列的 FPS，并在',
    '. This profile preserves the submitted resolution and frame count; it does not add, drop, or interpolate frames.': '中填写相同的值。此配置会保留提交分辨率和帧数，不会增加、丢弃或插值帧。',
    'Download the same encoding script': '下载同一编码脚本',
    'Do not first create a lossless MP4 and then transcode it again. That adds a large intermediate file and an unnecessary processing step; the final lossy encode still determines the submitted pixels. The organizers use this exact profile when normalizing comparison inputs.': '不要先生成无损 MP4 再进行二次转码。这会增加巨大的中间文件和不必要的处理步骤；最终的有损编码仍决定提交画面。组织者在统一比较输入时也使用完全相同的配置。',
    'Current upload limits: Main Track and Policy Track accept one ZIP up to 3 GiB; Long-Horizon Track accepts one ZIP up to 12 GiB. The same limit applies to the archive\'s declared expanded contents. Uploads use resumable 16 MiB parts with up to 6 parallel lanes, may contain up to 20,000 entries, and are checked in private storage. Uploaded code is never executed.': '当前上传上限：主赛道和策略赛道每次可提交一个不超过 3 GiB 的 ZIP；长时程赛道为 12 GiB。声明的解压后内容也采用同一上限。上传使用可续传的 16 MiB 分片和最多 6 路并行连接，最多包含 20,000 个条目，并在私有存储中检查；上传的代码绝不会执行。',
    'Account': '账户', 'Demo': '演示', 'Guide.': '指南。', 'Prepare Your': '准备您的', 'Submission.': '提交。',
    'Submission Portal': '提交门户', 'Sign In →': '登录 →', 'Submit Your Results': '提交您的结果', 'Download Manifest Example': '下载 Manifest 示例',
    'Needs Changes / Accepted / Rejected': '需要修改 / 已接受 / 已拒绝', 'Policy-rollout demo scores': '策略轨迹演示分数',
    'AgiBot G2 · Demo Scores': 'AgiBot G2 · 演示分数', 'AgiBot G2 · Long Horizon': 'AgiBot G2 · 长时程',
    'Do not include passwords, API keys, private tokens, or personal data in uploaded packages.': '上传包中不得包含密码、API 密钥、私有令牌或个人数据。',
    'access request form': '访问申请表',
    'check your assigned model, choose a Track and platform, and optionally add submission notes.': '检查已分配的模型，选择赛道和平台，并可选填写提交说明。',
    'choose a ZIP. The browser uploads resumable parts and the background worker checks the assembled package and records its SHA-256 checksum. After an interruption, reopen the draft and reselect the same file to resume.': '选择 ZIP。浏览器会上传可续传分片，后台工作进程会检查合并后的提交包并记录 SHA-256 校验和。中断后重新打开草稿并选择同一文件即可续传。',
    'confirm authenticity, permissions, and the absence of secrets.': '确认材料真实性、相关权限以及其中不含机密信息。',
    'The validator ships with the submission portal source code; its standalone public distribution is pending. In the': '验证器随提交门户源代码提供，独立公开版本尚待发布。在',
    ', follow four steps:': '中，请按以下四步操作：',
    '. Organizers review the selected Track, platform, trajectory horizon or policy distribution, coverage, and applicable metrics before accepting results. They can move a submitted record to Under Review, request changes, or accept or reject it with a visible review note.': '中跟踪进度。组织者会在接受结果前审核所选赛道、平台、轨迹时长或策略分布、覆盖范围及适用指标。他们可以将记录转为“审核中”、要求修改，或通过带有可见审核说明的方式接受或拒绝。',
    'The following': '以下',
    'format is implemented by this portal. It is a proposed upload contract, not a claim that the benchmark\'s final release format is frozen. Include': '格式已由本门户实现。它是拟定的上传约定，并不表示基准的最终发布格式已经冻结。请填写',
    'as': '为', 'matching your form. Also include': '并与表单选择一致。还需包含', 'is': '为',
    'for Policy Track, otherwise': '用于策略赛道，其他赛道则为', 'or': '或',
    '. Older drafts must select a Track and revalidate their package. Use the current manifest example; obsolete or unknown manifest fields are rejected.': '。旧草稿必须选择赛道并重新验证提交包。请使用当前 Manifest 示例；已废弃或未知字段会被拒绝。',
    'For prediction-video packages, each manifest entry specifies': '对于预测视频包，每个 Manifest 条目需指定',
    '. Use MP4 files with H.264 video for compatibility. Explain the action-to-frame mapping, initial-frame inclusion, resolution, and any resampling in the README. Do not silently alter the requested trajectory or select only successful attempts.': '。为保证兼容性，请使用包含 H.264 视频的 MP4 文件。在 README 中说明动作与帧的映射、是否包含初始帧、分辨率及任何重采样。不要擅自更改要求的轨迹或只选择成功样例。',
    'Every Track package must include': '每个赛道的提交包都必须包含',
    '. If the submission becomes that model\'s leaderboard best, this one video is copied to the public leaderboard so all models can be compared on the same episode.': '。如果本次提交成为该模型在对应赛道的榜单最佳成绩，系统会仅复制这一段视频到公开排行榜，让所有模型在相同 episode 上进行对比。'
  });

  Object.assign(zh, {
    'Automatic Evaluation · Best Completed Results': '自动评测 · 最佳已完成结果',
    'Prepare your materials, choose a track, and submit for evaluation.': '准备材料，选择赛道，并提交评测。',
    'Submit for Evaluation': '提交评测', 'Submit for Evaluation →': '提交评测 →', 'Track Your Results': '跟踪评测结果',
    'Evaluation and Publication': '评测与发布', 'Confirm and Submit': '确认并提交',
    'Automatic Evaluation': '自动评测', 'Completed / Failed / Needs Changes': '已完成 / 失败 / 需要修改',
    'After submission, the system runs package checks and the metrics required by the selected Track. Organizers may request changes or reject an invalid submission, but there is no final approval stage after all required metrics pass.': '提交后，系统会执行提交包检查和所选赛道要求的指标评测。组织者仍可要求修改或拒绝无效提交，但全部必需指标通过后不再设置最终人工审核阶段。',
    'If changes are requested, edit the existing submission and resubmit it. Failed or incomplete attempts do not consume a V number. You can withdraw a nonfinalized submission; contact the organizers to request changes to a finalized record.': '如果收到修改要求，请编辑现有提交并重新提交。失败或未完成的尝试不会占用 V 版本号。您可以撤回尚未最终完成的提交；如需更改已完成记录，请联系组织者。',
    'When all required metrics pass, the submission completes automatically, receives the next successful V number, and updates the public leaderboard only if its score improves the model\'s current best. A lower successful score remains visible on that submission without replacing the best result.': '全部必需指标通过后，提交会自动完成并获得下一个成功 V 版本号；只有分数高于该模型当前最佳成绩时，才会更新公开排行榜。较低的成功成绩仍显示在该次提交中，但不会替换最佳结果。',
    'I have permission to submit these artifacts and authorize the organizers to inspect them for evaluation and validation.': '我有权提交这些产物，并授权组织者为评测和验证目的进行检查。',
    'I understand that structural validation is not a score. After all required metrics pass, the result completes automatically and replaces the public best only when it improves the score.': '我理解结构验证并不等于评测分数。全部必需指标通过后，结果会自动完成，并且只有成绩提升时才替换公开最佳结果。',
    'Submission locks this record while automatic evaluation runs or until the organizers request changes. No benchmark scores are generated at this step.': '提交后，该记录会在自动评测期间保持锁定，除非组织者要求修改。此步骤本身不会生成基准分数。',
    'Every submission stays tied to its account, model, and Track. A V number is assigned only after a successful evaluation. Unsupported metrics are N/A, never fabricated zeros.': '每次提交都与其账号、模型和赛道绑定。只有评测成功后才会分配 V 版本号；不支持的指标显示为 N/A，绝不会伪造成零分。',
    'The original ZIP and all other package files remain private. When a completed submission becomes the model\'s best result for a Track, only its declared': '原始 ZIP 和提交包中的其他文件仍保持私有。当一份已完成提交成为该模型在某个赛道的最佳成绩时，只会公开其中声明的',
    'comparison video is published beside the score. Drafts, replaced files, and withdrawn records remain on disk for audit; a final retention policy must be established before public launch.': '对比视频，并显示在分数旁。草稿、被替换文件和已撤回记录会保留在磁盘中用于审计；正式公开前仍需制定最终保留策略。',
    'Matched Episode': '固定测试样例', 'Select a model to compare': '选择模型进行对比',
    'Click any model row to show the example.': '点击任意模型行以查看示例。',
    'Comparison episode unavailable': '暂无对比 Episode',
    'This illustrative result does not have a submitted episode.': '该演示结果没有对应的提交 Episode。',
    'No public comparison video is available for this legacy result.': '该历史结果暂没有公开对比视频。',
    'No. All three Track forms require prediction-video artifacts. Self-reported numbers alone are insufficient for evaluation.': '不可以。三条赛道均要求提供预测视频产物；仅提交自报数值不足以进行评测。',
    'check the summary and enter the automatic evaluation queue.': '检查摘要并进入自动评测队列。',
    'Human Hands': '人手', 'Track Not Selected': '未选择赛道', 'Assigned on Submission': '提交时分配',
    'Track 1 — Main Track': '赛道 1 — 主赛道', 'Track 2 — Policy Track': '赛道 2 — 策略赛道', 'Track 3 — Long-Horizon Track': '赛道 3 — 长时程赛道',
    'First 30 seconds · PO, KRO, IA and MVC where supported. The separate Policy score is not required for this submission.': '前 30 秒 · 评测 PO、KRO、IA，以及受支持时的 MVC。本次提交不要求单独提供策略分数。',
    'Policy-distribution rollouts · KRO, IA and MVC where supported · AgiBot G2. No PO metric.': '策略分布轨迹 · 评测 KRO、IA，以及受支持时的 MVC · AgiBot G2。不包含 PO 指标。',
    'Full prescribed trajectories · PO, KRO, IA and MVC where supported. No Policy score.': '规定的完整轨迹 · 评测 PO、KRO、IA，以及受支持时的 MVC。不包含策略分数。',
    'Policy Track: upload prediction videos on policy-rollout actions. AgiBot G2 only; KRO / IA / MVC where supported.': '策略赛道：上传基于策略轨迹动作的预测视频。仅支持 AgiBot G2；评测 KRO / IA，以及受支持时的 MVC。',
    'Upload prediction videos on recorded actions. PO / KRO / IA / MVC where supported; Main evaluates 30s, Long-Horizon evaluates full trajectories.': '上传基于记录动作的预测视频。评测 PO / KRO / IA，以及受支持时的 MVC；主赛道评测 30 秒，长时程赛道评测完整轨迹。',
    'The materials accurately reflect this model and the declared evaluation setup. Any relevant additional information is included in my submission notes.': '材料准确反映此模型及声明的评测设置，所有相关补充信息均已写入提交说明。',
    'I have permission to submit these artifacts and authorize the organizers to inspect them for evaluation and review.': '我有权提交这些产物，并授权组织者为评测和审核目的进行检查。',
    'The package contains no API keys, passwords, access tokens, or unnecessary personal information.': '提交包不包含 API 密钥、密码、访问令牌或不必要的个人信息。',
    'I understand that this is a preview intake system. Structural validation is not score verification, and publication requires separate organizer review.': '我理解这是预览版接收系统。结构验证并不等于分数验证，发布仍需组织者另行审核。',
    'Waiting for Evaluation': '等待评测', 'Package and Coverage Validation': '提交包与覆盖范围验证', 'Physical State Correctness': '物理状态正确性',
    'Interaction Spatial Alignment': '交互空间对齐', 'Key Interaction Area Fidelity': '关键交互区域保真度', 'Score Aggregation': '分数聚合',
    'Waiting for an evaluation operator or worker.': '等待评测操作人员或工作进程。',
    'Submitted; waiting for an evaluation operator or worker.': '已提交，正在等待评测操作人员或工作进程。',
    'Imported submission; evaluation progress has not been reported.': '已导入提交，尚未上报评测进度。',
    'Evaluation stage recorded.': '评测阶段已记录。', 'Leaderboard saved. Only published entries appear on the project homepage.': '排行榜已保存。只有已发布条目会显示在项目主页。',
    'Unable to change password. Check your username and current password.': '无法修改密码，请检查用户名和当前密码。',
    'Choose a different password of 12–256 characters and confirm it twice.': '请选择不同的 12–256 字符密码，并输入两次以确认。',
    'Password changed elsewhere. Sign in again.': '密码已在其他位置更改，请重新登录。',
    'Password updated. All previous sessions have been invalidated. Sign in with your new password.': '密码已更新，所有旧会话均已失效。请使用新密码登录。',
    'Bind a model name (1–200 characters) when creating the account.': '创建账户时请绑定 1–200 个字符的模型名称。',
    'Use a 3–40 character username (letters, numbers, _, -, .) and a 12–256 character initial password.': '用户名需为 3–40 个字符（字母、数字、_、-、.），初始密码需为 12–256 个字符。',
    'Provide valid applicant details.': '请提供有效的申请人信息。', 'This application has already been processed.': '此申请已处理。',
    'Username or email is already assigned. No account was changed.': '用户名或邮箱已被占用，未更改任何账户。',
    'Activation links have been retired. Use the username and initial password supplied by the organizers.': '激活链接已停用，请使用组织者提供的用户名和初始密码。',
    'Choose Main Track, Policy Track, or Long-Horizon Track explicitly.': '请明确选择主赛道、策略赛道或长时程赛道。',
    'Choose a valid platform.': '请选择有效平台。', 'Policy Track currently covers AgiBot G2 only.': '策略赛道目前仅覆盖 AgiBot G2。',
    'Only failed or cancelled evaluations of active submissions can be retried.': '只有活动提交中失败或已取消的评测可以重试。',
    'A valid decision and submitter-visible note are required.': '必须填写有效决定和提交者可见说明。',
    'Unknown benchmark Track.': '未知的基准赛道。'
  });

  Object.assign(zh, {
    // Current registration, team and submission workflow. These entries
    // intentionally override older preview-era wording above.
    'Submission': '提交', 'Research Submission Portal': '评测提交平台',
    'Submission Portal': '提交平台', '/ Submission': '/ 提交',
    'WorldOracle · Research Submission Portal': 'WorldOracle · 评测提交平台',
    'Submission Guide': '提交指南', 'Submission Overview': '提交概览',
    'Prepare Your Submission': '准备提交材料', 'Open Submission Portal ↗': '打开提交平台 ↗',
    'Back to Submission Portal ↗': '返回提交平台 ↗',
    'My Submissions': '我的提交', 'My Team': '我的队伍', 'Register': '注册',
    'Automatic Evaluation · Best Completed Results': '自动评测 · 榜单展示各模型的最佳完成结果',
    'Register & Verify': '注册并验证邮箱', 'Join Approved Team': '加入已审核队伍', 'Eligibility & Teams': '参评资格与队伍',
    'Researchers and model developers can register a verified personal account. Formal submissions require an approved team, an organizer-approved model, and a team role with submission permission. Both open-weight and closed-source approaches may participate.': '研究人员和模型开发者可以注册并验证个人账号。发起正式提交前，所在队伍和待提交模型必须通过主办方审核，且当前成员需具有提交权限。开源权重和闭源方法均可参评。',
    'WorldOracle uses one evaluation framework across two data distributions: human-operated trajectories and policy rollouts collected on a real robot. The benchmark covers AgiBot G2, YAM, and human-hand embodiments. Choose Main, Policy, or Long-Horizon Track and submit prediction videos; no separate protocol selection is needed.': 'WorldOracle 使用一套统一评测框架，覆盖两种数据分布：人工操作轨迹，以及在真实机器人上采集的策略轨迹。基准包含 AgiBot G2、YAM 和 Human Hand 三种本体。请选择主赛道、策略赛道或长时程赛道，并提交预测视频；无需另外选择评测协议。',
    'An uploaded package is not yet a verified benchmark result. Every formal submission receives a Track-specific submission number. A successful V number is assigned only after every required metric passes, and only an improved result replaces the model\'s current leaderboard best.': '上传提交包不等于已获得有效评测结果。每次正式提交都会获得该赛道独立的提交编号；只有全部必需指标通过后才会分配成功 V 版本号，且只有更好的成绩会替换该模型在榜单上的当前最佳结果。',
    'Choose one organizer-approved model registered to your team, then select the Track and platform and optionally add submission notes. Each formal attempt receives the next team submission number within its Track. V1, V2, and so on are assigned per team model only after successful evaluations; failed attempts never consume a V number.': '先选择一个登记在当前队伍名下且已通过主办方审核的模型，再选择赛道和平台，并可选填提交说明。每次正式尝试都会获得当前队伍在该赛道中的下一个提交编号。V1、V2 等版本号仅在评测成功后，按队伍内模型分别分配；失败尝试不占用 V 版本号。',
    'Track limits and required coverage': '赛道上限与必需覆盖范围',
    'Main Track:': '主赛道：', 'Policy Track:': '策略赛道：', 'Long-Horizon Track:': '长时程赛道：',
    'one ZIP below': '提交一个小于', '3 GiB': '3 GiB', '12 GiB': '12 GiB',
    '. Submit the first 30 seconds of every required episode using recorded actions.': '的 ZIP。需提交每个必需 episode 在记录动作条件下的前 30 秒预测。',
    'Frame rate is platform-specific: AgiBot G2 and YAM use 30 FPS (900 frames for Main); Human Hand uses 15 FPS (450 frames for Main). Preserve the native frame rate and do not duplicate frames.': '帧率按平台区分：AgiBot G2 和 YAM 使用 30 FPS（主赛道为前 900 帧）；人手平台使用 15 FPS（主赛道为前 450 帧）。请保留原生帧率，不要通过复制帧升到 30 FPS。',
    '. Submit the complete policy-distribution rollout for AgiBot G2 and use': '的 ZIP。需提交 AgiBot G2 在策略数据分布下的完整预测轨迹，并在 manifest 中使用',
    'in the manifest.': '。',
    '. Submit each complete episode using recorded actions; do not truncate it to the Main Track horizon.': '的 ZIP。需提交每个 episode 在记录动作条件下的完整预测，不得截断为主赛道的时长。',
    'The limit applies independently to both the uploaded ZIP and the sum of its declared expanded contents. A package may contain at most 20,000 entries. ZIP symlinks, encrypted entries, duplicate or unsafe paths, and a wrapper directory above': '容量上限同时适用于上传的 ZIP 文件和其声明的解压后总大小，两者分别校验。每个包最多包含 20,000 个条目。包含软链接、加密条目、重复或不安全路径，或在',
    'are rejected.': '之上多套一层目录的 ZIP 都会被拒绝。',
    'Do not reorder episodes by array position. Preserve the official': '不要根据数组位置重新排列 episode。请保留官方的',
    'identity and map every video explicitly in': '标识，并在',
    '. Frame indices must be contiguous from zero; synchronized views of an episode must have equal frame counts, frame rates, and durations. Do not select only successful rollouts or silently replace a trajectory.': '中显式映射每个视频。帧索引必须从 0 开始且连续；同一 episode 的同步多视角必须具有相同的帧数、帧率和时长。不得只挑选成功轨迹，也不得在不说明的情况下替换轨迹。',
    'The implemented schema is': '当前实现的 schema 版本为', 'matching the form. Set': '，必须与表单选择一致。请将',
    '. Set': '。将', 'to': '设为', 'or': '或', ', or': '，或',
    ', matching the form. Set': '，并与表单选择一致。再将', '; set': '；将', ', and': '，并将',
    'only for Policy Track and': '仅用于策略赛道，其他赛道使用', 'otherwise; and set': '；同时将',
    '. Unknown top-level manifest fields are rejected.': '。manifest 中未定义的顶层字段会被拒绝。',
    'Each prediction entry must include': '每条预测记录必须包含', 'and': '以及',
    '. The standard output is H.264 MP4,': '。标准输出为 H.264 MP4，像素格式为',
    ', no audio, source resolution preserved, and the platform\'s native benchmark frame rate. In': '，不含音频，保留原始分辨率，并使用对应平台的基准原生帧率。请在',
    ', explain the action-to-frame mapping, whether the initial frame is included, the original resolution, and any unavoidable resampling.': '中说明动作与帧的对应关系、是否包含首帧、原始分辨率，以及任何无法避免的重采样。',
    'Required compression profile': '必须遵循的压缩规范',
    'Encode the original JPEG or PNG sequence directly to the final MP4. Use': '请直接将原始 JPEG 或 PNG 序列编码为最终 MP4。使用',
    ', the': '，选择', 'preset, two-pass average bitrate': '预设，并使用两遍平均码率',
    ', a 60-frame GOP, scene-cut disabled, and no audio. Do not create a lossless MP4 first and transcode it again. That intermediate does not improve the final submitted pixels and can introduce a second indexing or timing step.': '，GOP 设为 60 帧，禁用场景切换，且不包含音频。不要先生成无损 MP4 再二次转码：该中间文件不会提升最终提交画面的质量，反而可能引入第二次索引或时序误差。',
    'The five benchmark baseline packages currently shown for AgiBot G2—IRASim, DreamDojo, Ctrl-World, Cosmos 3, and GE-Sim 2.0—were all encoded at the same target video bitrate:': '当前 AgiBot G2 榜单展示的五个基线模型——IRASim、DreamDojo、Ctrl-World、Cosmos 3 和 GE-Sim 2.0——都采用相同的目标视频码率：',
    'in both passes. The two ffmpeg commands are the analysis pass and the final-output pass of one two-pass encode, not two different compression settings.': '，两遍编码的目标码率一致。两条 ffmpeg 命令分别用于分析和生成最终视频，它们属于同一次两遍编码，并不是两套不同的压缩参数。',
    'The commands below use 30 FPS for AgiBot G2 and YAM. For Human Hand, change both -framerate values to 15.': '下面的命令为 AgiBot G2 和 YAM 使用 30 FPS。如果是人手平台，请将两处 -framerate 的值改为 15。',
    'The example input is one': '示例输入为一组',
    'sequence. For six-digit PNG input, use': '序列。如果 PNG 文件名为六位数字，请使用',
    '. The two passes read the same source frames and write only one final video.': '。两遍编码读取同一组源帧，并且只产生一个最终视频。',
    'Download Encoding Script': '下载编码脚本', 'Run the helper as': '请按以下方式运行脚本：',
    '. This is the same per-video encoding core used for the benchmark packages. It encodes one episode/view at a time; it is not the internal bulk orchestrator that walks the full dataset, creates': '。该脚本采用与基线包相同的单视频编码核心，一次只处理一个 episode 的一个视角；它不是内部使用的整套批处理程序，不会自动遍历整个数据集、生成',
    ', and builds the ZIP.': '或打包 ZIP。',
    'Set FPS to 30 for AgiBot G2 and YAM, and to 15 for Human Hand.': 'AgiBot G2 和 YAM 的 FPS 设为 30，人手平台的 FPS 设为 15。',
    'It accepts contiguous': '脚本支持连续编号的',
    'must be one flat frame directory for a single episode/view. It accepts contiguous': '必须是单个 episode、单个视角对应的一层帧目录。脚本支持连续编号的',
    'files starting at zero, performs both ffmpeg passes automatically, and fails if the output frame count differs. An optional fourth argument changes the bitrate, for example': '文件，编号必须从 0 开始。脚本会自动执行两遍 ffmpeg；如输出帧数与输入不一致会直接报错。可选的第四个参数可调整码率，例如',
    '. Arrange the resulting MP4 files in the task/episode/view paths declared by': '。生成 MP4 后，请按照',
    'before creating the submission ZIP.': '中声明的 task/episode/view 路径组织文件，再创建提交 ZIP。',
    'is the parameter that primarily controls file size;': '是控制文件大小的主要参数；',
    'controls how efficiently that bitrate is used, not the target size. CRF is not used for the standard package because its final size is content-dependent. The approximate total is': '只影响在该码率下的编码效率，不决定目标文件大小。标准提交包不使用 CRF，因为 CRF 的最终大小取决于内容。总大小可近似估算为',
    ', plus MP4 and ZIP overhead. Use the same bitrate for every view and episode. A single-view submission is therefore smaller than a three-view submission, but each video receives the same compression strength. If the complete ZIP exceeds the Track limit, lower the bitrate uniformly for every video. Record the reduced bitrate in the submission README (': '，再加上 MP4 容器和 ZIP 的开销。所有视角和 episode 必须使用相同码率。因此，单视角提交包会比三视角更小，但每个视频的压缩强度相同。如果完整 ZIP 超过赛道上限，请对所有视频统一降低码率，并在提交说明（',
    ').': '）中记录调整后的码率。',
    'Package and verify': '打包与校验', 'stores the already-compressed MP4 files without wasting time recompressing them. Before uploading, confirm the ZIP is below the selected Track limit and that': '会直接存储已压缩的 MP4，避免浪费时间再次压缩。上传前，请确认 ZIP 小于所选赛道的上限，并确保',
    'is at the ZIP root. Every Track package must include': '位于 ZIP 根目录。每个赛道的提交包都必须包含',
    '; if the result becomes that model\'s leaderboard best, its complete 30-second comparison video is shown publicly. All other package files remain private.': '；如果本次结果成为该模型的榜单最佳成绩，系统会公开展示这段完整的 30 秒对比视频。其余提交包文件仍保持私有。',
    'Do not include passwords, API keys, private tokens, personal data, raw GT frames, caches, checkpoints, or unrelated experiment outputs.': '提交包中不得包含密码、API 密钥、私有令牌、个人数据、原始 GT 帧、缓存、检查点或无关的实验输出。',
    'Uploads are resumable: the browser sends verified 16 MiB parts over up to 6 parallel lanes. Each part is checked with SHA-256, the assembled ZIP receives a full-file SHA-256, and interrupted uploads can resume by reopening the same draft and selecting the identical ZIP. Incomplete uploads expire after 48 hours.': '上传支持断点续传：浏览器最多通过 6 路并发连接发送经校验的 16 MiB 分片。每个分片都会校验 SHA-256，合并后的 ZIP 还会计算完整文件 SHA-256。上传中断后，重新打开同一草稿并选择完全相同的 ZIP 即可继续；未完成的上传会在 48 小时后过期。',
    'Track admission checks inspect video headers and decode the first frame, enforce the platform frame rate (30 FPS for AgiBot G2 and YAM; 15 FPS for Human Hand), validate view counts, synchronization, and Main Track’s 30-second limit. They do not decode every frame, verify the complete official episode list, assess data leakage, recompute metrics, or establish result validity. The evaluation completes automatically only after every metric declared by the validated package has a valid result.': '赛道入队检查会读取视频头并解码首帧，强制核对平台帧率（AgiBot G2 和 YAM 为 30 FPS，人手平台为 15 FPS），同时检查视角数量、同步性和主赛道 30 秒上限。这一阶段不会解码所有帧、核验完整官方 episode 列表、评估数据泄漏、重新计算指标，或判定结果有效性。只有通过校验的提交包所声明的每一项指标都产生有效结果后，评测才会自动完成。',
    'Complete policy-rollout trajectories · PO, KRO, IA and MVC where supported · AgiBot G2.': '完整的策略轨迹 · 评测 PO、KRO、IA，以及受支持时的 MVC · AgiBot G2。',
    'Confirm and Submit:': '确认并提交：',
    '. After submission, the system runs package checks and the metrics required by the selected Track. Organizers may request changes or reject an invalid submission, but there is no final approval stage after all required metrics pass.': '中查看评测进度。提交后，系统会执行提交包检查，并计算所选赛道需要的指标。主办方可以要求修改或拒绝无效提交；所有必需指标通过后，不再另设最终人工审批环节。',
    'Official evaluation quotas are not yet defined. Local abuse limits are currently 20 new drafts and 10 upload attempts per account per day; these are portal limits, not benchmark evaluation allowances. Every formal attempt is numbered within its Track, while V numbers count successful evaluations only.': '正式评测额度尚未最终确定。当前平台为防止滥用，限制每个账号每日最多新建 20 个草稿并尝试上传 10 次；这些只是平台操作限制，不代表基准评测额度。每次正式尝试都会在所属赛道内编号，V 版本号则只计数成功评测。',

    'Individual Registration': '个人注册', 'Register First.': '先完成注册。', 'Team Up Next.': '再加入或创建队伍。',
    'Create a verified personal identity with a unique public nickname. Registration unlocks benchmark task success-rate details; formal submissions require an approved team.': '使用唯一的公开昵称创建个人账号，并完成邮箱验证。注册后可查看任务的具体成功率；正式提交还需加入已审核通过的队伍。',
    'Personal registration → verified email → approved team → authorized submission.': '个人注册 → 验证邮箱 → 队伍审核通过 → 获得提交权限',
    'Your private identity and contact details are never published. Email and homepage visibility are your choice.': '身份与联系方式默认不公开；是否公开邮箱和个人主页由你自行选择。',
    'Read Eligibility & Team Rules ↗': '查看参评资格与组队规则 ↗', 'Create Personal Account': '创建个人账号',
    'Email Address': '邮箱地址', 'Used for verification, login recovery and benchmark notices.': '用于邮箱验证、找回账号和接收评测通知。',
    'Nickname ID': '昵称 ID', 'Unique and public. Letters, numbers, underscore, hyphen and period.': '该昵称全站唯一且会公开显示，可使用字母、数字、下划线、连字符和句点。',
    'Email': '邮箱', 'English': '英文', 'English + 中文': '中英双语',
    'Password': '密码', 'Confirm Password': '确认密码', 'Identity': '身份类型', 'Optional': '选填',
    'Prefer not to say': '暂不填写', 'University / Research': '高校 / 科研机构', 'Company': '企业',
    'Cross-Institution': '跨机构队伍', 'Independent Researcher': '独立研究者', 'Affiliation': '所属机构',
    'Personal / Academic / Code Homepage': '个人 / 学术 / 代码主页', 'Phone / Instant Messaging': '电话 / 即时通讯',
    'Optional · private': '选填 · 不公开', 'Notification Language': '通知语言',
    'Account, team and evaluation notifications are sent in English.': '账号、组队和评测相关通知统一使用英文发送。',
    'Allow my verified email to be shown with my public participant profile.': '允许在公开的参评者信息中显示我已验证的邮箱。',
    'Allow my homepage to be shown with my public participant profile.': '允许在公开的参评者信息中显示我的主页。',
    'I accept the registration and participation terms. Participation authorization and publicity permission are handled separately.': '我已阅读并同意注册与参评条款。参评授权和宣传授权将分别处理。',
    'I have read the privacy notice and authorize storage of these details for account verification and benchmark operations.': '我已阅读隐私说明，并同意平台为账号核验和评测运营保存上述信息。',
    'Register and Verify Email ↗': '注册并验证邮箱 ↗',
    'Verify Email': '验证邮箱', 'Email Verification': '邮箱验证', 'Confirm': '确认',
    'This marks the address as verified and lets the account sign in, create a team, or accept a team invitation.': '验证后，你可以使用该账号登录、创建队伍或接受队伍邀请。',
    'Verify Email ↗': '完成邮箱验证 ↗',

    'Your Work.': '你的评测工作，', 'One Workspace.': '集中在一个工作区。',
    'Prepare a draft, upload your materials, and follow the review.': '创建草稿、上传提交材料，并在这里跟踪评测进度。',
    'A verified personal account is required. Formal submissions additionally require an approved team and an authorized team role.': '登录前需先完成个人邮箱验证。发起正式提交还需所在队伍通过审核，并由队长授予提交权限。',
    'Use your unique nickname ID, not your email address.': '请使用唯一昵称 ID 登录，不要输入邮箱地址。',
    'Need an account?': '还没有账号？', 'Change Your Password': '修改密码',
    'using your current password. If you have forgotten it, contact the organizers.': '需要先验证当前密码。如果已忘记密码，请联系主办方。',
    'Resend email verification': '重新发送验证邮件', 'Request Verification Email': '发送验证邮件',

    'No Approved Team': '尚未加入已审核队伍', 'Team': '队伍', 'Submissions.': '提交记录。',
    '+ New Submission': '+ 新建提交', 'Resolve Team Access →': '处理队伍权限 →',
    'Every formal submission receives a team Track-specific submission number. A V number is assigned only after all required metrics pass; an improved score updates the model\'s best leaderboard result automatically.': '每次正式提交都会获得队伍内、该赛道独立的提交编号。只有全部必需指标评测通过后才会分配 V 版本号；如果成绩更好，系统会自动更新该模型的榜单最佳结果。',
    'Scores': '分数', 'Current Stage': '当前阶段', 'Your First Submission Starts Here.': '从这里开始第一次提交。',
    'Submission result or current stage': '提交结果或当前评测阶段',
    'Read the guide, create a draft, and save your progress one step at a time.': '先阅读提交指南，再创建草稿。每一步都会保存，可以稍后继续。',
    'Explore the Package Format →': '查看提交包格式 →', 'Continue Draft': '继续编辑草稿', 'View Submission': '查看提交',

    'Your account and submission history, in one place.': '在这里统一查看账号信息和历史提交。',
    'Account Information': '账号信息', 'Personal identity and visibility choices are stored separately from team eligibility and publicity authorization.': '个人身份信息及其公开设置，与队伍参评资格和宣传授权分开保存。',
    'Institution': '机构', 'Homepage': '主页', 'Public Visibility': '公开范围', 'Verified': '已验证',
    'Pending verification': '等待验证', 'Not provided': '未填写', 'Not joined': '未加入队伍',
    'Submission History': '提交历史', 'Read-only records. Continue editing drafts from My Submissions, not from this page.': '本页只用于查看历史记录。如需继续编辑草稿，请前往“我的提交”。',
    'Submission ID': '提交 ID', 'Created (UTC)': '创建时间（UTC）', 'Updated (UTC)': '更新时间（UTC）',
    'No Submissions Yet.': '还没有提交记录。', 'Your saved drafts and submitted records will appear here.': '已保存的草稿和正式提交都会显示在这里。',

    'Eligibility & Team Management': '参评资格与队伍管理', 'My': '我的', 'Team.': '队伍。',
    'Formal quota and submission authority belong to an approved participating entity.': '正式提交额度和提交权限均归属于已审核通过的参评队伍。',
    'Create Team': '创建队伍', 'Apply by Team ID': '通过队伍 ID 申请加入', 'Team ID': '队伍 ID',
    'Your Role': '你的角色', 'Formal Quota': '正式提交额度', 'Legacy unlimited': '历史账号（不限额）',
    'Open Team Console →': '进入队伍管理 →', 'No Team Yet.': '尚未加入队伍。',
    'Create a team for organizer review, accept an invitation sent to this verified email, or apply using a team ID.': '你可以创建队伍并提交主办方审核，接受发送到已验证邮箱的邀请，或使用队伍 ID 申请加入。',
    'Create a team for organizer review, accept an in-platform invitation sent to your participant ID, or apply using a team ID.': '你可以创建队伍并提交主办方审核，接受发送到昵称 ID 的站内邀请，或使用队伍 ID 申请加入。',
    'Pending Invitations': '待处理邀请', 'Role:': '角色：',
    'Open the secure invitation link delivered by email to accept. You can decline here after signing in with the invited verified email.': '请通过邮件中的安全链接接受邀请。使用被邀请的已验证邮箱登录后，也可在这里拒绝。',
    'This invitation was sent to your unique participant ID. Accepting it adds this account to the team.': '这条邀请发送给了你的唯一昵称 ID。接受后，当前账号会加入该队伍。',
    'Decline Invitation': '拒绝邀请', 'Join Requests': '入队申请', 'Withdraw': '撤回',

    'Register Team': '注册队伍', 'Team Registration': '队伍注册', 'Establish a': '创建一个', 'Participating Entity.': '参评队伍。',
    'Single-person teams are supported. Institutional identity, representative authority and model relationship are manually reviewed before formal quota is granted.': '支持单人队伍。主办方将人工核验机构身份、代表权限以及队伍与模型的关系，通过后才会分配正式提交额度。',
    '← Back to My Team': '← 返回我的队伍', '← My Team': '← 返回我的队伍', 'Team Application': '队伍申请', 'Team Name': '队伍名称',
    'Team Type': '队伍类型', 'Country / Region': '国家 / 地区', 'Institution(s) / Independent Entity': '所属机构 / 独立研究者主体',
    'Use full legal or academic names consistent with the responsible email domain.': '请填写完整的法定或学术机构名称，并与负责人邮箱域名保持一致。',
    'Responsible Contact Email': '负责人联系邮箱', 'Bound to your verified account and checked during manual review.': '该邮箱将与你已验证的账号绑定，并用于人工审核。',
    'Project Relationship & Representative Authority': '项目关系与代表权限',
    'Homepage, paper, repository, organization identity and model ownership/authorization evidence': '请提供主页、论文、代码仓库、组织身份，以及模型所有权或授权证明。',
    'Expected Models / Version Clues': '计划提测的模型 / 版本线索', 'Source / Referrer / Notes': '来源 / 推荐人 / 补充说明',
    'Submit for Manual Review ↗': '提交人工审核 ↗',
    'Apply to Team': '申请加入队伍', 'Apply to Join': '申请加入', 'Join by': '通过',
    'Team ID.': '队伍 ID 加入。',
    'Message to Captain': '给队长的留言', 'Send Join Request ↗': '发送入队申请 ↗',
    'Team Invitation': '队伍邀请', 'You were invited as': '你被邀请担任', '. Accepting binds this verified account to the team.': '。接受后，当前已验证账号将加入该队伍。',
    'Accept Invitation': '接受邀请', 'Decline': '拒绝', 'Authority Review': '代表权限核验',
    'This team is awaiting organizer review. Formal submissions remain locked until approval and quota allocation.': '该队伍正在等待主办方审核。审核通过并分配额度前，无法发起正式提交。',
    'Members': '队员', 'Authority Verified': '代表权限已核验', 'Captain': '队长', 'Submission Member': '提交成员', 'Collaborator': '协作成员',
    'Member submission quota': '成员可用提交额度', 'Update': '更新', 'Remove': '移除', 'Invite by Verified Email': '通过已验证邮箱邀请',
    'Invite by Participant ID': '通过昵称 ID 邀请', 'Unique Nickname ID': '唯一昵称 ID',
    "The invitation appears in the participant's My Team page; no invitation email is sent.": '邀请会显示在对方的“我的队伍”页面中，不发送邀请邮件。',
    'Send In-Platform Invitation': '发送站内邀请',
    'Send Invitation': '发送邀请', 'Models': '模型', 'Evidence ↗': '证明材料 ↗', 'No models registered.': '尚未登记模型。',
    'Register Model for Review': '登记模型并提交审核', 'Model Name': '模型名称', 'Project / Paper / Repository URL': '项目 / 论文 / 代码仓库链接',
    'Ownership / Authorization Relationship': '所有权 / 授权关系', 'Version / Reproduction State': '版本 / 复现状态', 'Register Model': '登记模型',
    'Pending Join Requests': '待处理的入队申请', 'Approve': '通过', 'Reject': '拒绝', 'Transfer Captain': '转交队长',
    'Only an active member whose representative authority has been verified by organizers may receive the role. The successor must confirm before the current captain can exit.': '只能将队长转交给代表权限已经主办方核验的在队成员。接任者确认后，原队长才可退出。',
    'Verified Successor': '已通过权限核验的接任者', 'Request Transfer': '发起转交', 'Captain Transfer Pending': '队长转交待确认',
    'Confirm Captain Responsibility': '确认接任队长', 'Leave Team': '退出队伍',

    '02 / Eligibility & Team Management': '02 / 参评资格与队伍管理',
    'Individual Registration · Team Binding · Authorized Submission': '个人注册 · 绑定队伍 · 授权提交',
    '1. Individual Registration — Low-Barrier Review': '1. 个人注册——低门槛核验',
    'Register with a verified email and a unique public nickname ID. Identity, affiliation, homepage, contact method and notification language are optional at this stage. Identity and contact details remain private; users separately choose whether their verified email and homepage are public. Registration and privacy notices are mandatory and recorded independently from publicity permission.': '使用已验证邮箱和唯一的公开昵称 ID 注册。此阶段可选填身份、机构、主页、联系方式和通知语言。身份与联系信息保持私密；是否公开已验证邮箱和主页由用户分别选择。必须确认注册条款和隐私说明，且两者与宣传授权分开记录。',
    'Register with a verified email and a unique public nickname ID. Identity, affiliation, homepage and contact method are optional at this stage. Account, team and evaluation notifications are sent in English. Identity and contact details remain private; users separately choose whether their verified email and homepage are public. Registration and privacy notices are mandatory and recorded independently from publicity permission.': '使用已验证邮箱和唯一的公开昵称 ID 注册。身份、机构、主页和联系方式均为选填；账号、组队和评测通知统一使用英文。身份与联系信息默认不公开，是否公开已验证邮箱和主页由用户分别选择。必须确认注册条款和隐私说明，且两者与宣传授权分开记录。',
    'Function:': '功能：', 'unlock detailed task execution-success statistics.': '解锁各任务的具体执行成功率。',
    'Purpose:': '目的：', 'measure community interest, preserve a permissioned mailing list and establish a verifiable participant identity.': '了解社区参与意向，在获得授权的前提下保留邮件联络信息，并建立可核验的参评者身份。',
    '2. Team Registration — Manual Eligibility Review': '2. 队伍注册——人工资格审核',
    'Formal participation belongs to an approved team or participating entity. Single-person teams are supported. Required information includes team name and type, country/region, full institution or independent-entity name, responsible person and verified contact email, plus project relationship and representative-authority evidence. Official submissions must prove both organizational identity and model ownership or authorization. Expected models, versions, source, referrer and operational notes are optional during application; every model is subsequently reviewed and recorded separately.': '正式参评资格归属于已审核的队伍或参评主体，支持单人队伍。申请时必须填写队伍名称与类型、国家/地区、机构全称或独立研究者主体、负责人及其已验证邮箱，并提供项目关系和代表权限证明。如以官方名义提交，还需证明组织身份以及模型所有权或授权关系。计划提测的模型与版本、来源、推荐人和运营说明可选填；每个模型后续仍会单独审核和建档。',
    'An approved team receives a shared formal submission quota. One responsible person should not control more than one approved quota-bearing entity.': '队伍审核通过后，会获得全队共享的正式提交额度。原则上，同一负责人只能归属于一个拥有正式额度的已审核参评主体。',
    '3. Roles & Membership': '3. 队内角色与成员管理', 'Invitation:': '邀请加入：', 'Application:': '申请加入：',
    'Creates or receives the team after review; submits, views progress, downloads reports, raises disputes, manages members and allocates member submission quota.': '创建队伍，或在队长转交完成后接管队伍；可提交评测任务、查看进度、下载评测报告、提出异议、管理成员及队内权限，并向提交成员分配额度。',
    'Submits within the quota assigned by the captain; views progress, downloads reports and raises disputes; cannot manage permissions.': '可在队长分配的额度内提交评测任务，并查看进度、下载报告和提出异议；不能管理队员权限。',
    'Default role after joining; views progress, reports and team membership; cannot formally submit or manage permissions.': '加入队伍后的默认角色；可查看评测进度、报告和队内成员，但不能发起正式提交或管理权限。',
    'the captain invites a verified email and chooses a role; the matching account accepts or declines.': '队长按已验证邮箱发送邀请并指定角色，匹配该邮箱的账号可接受或拒绝。',
    "the captain enters a participant's unique nickname ID and chooses a role; the invited participant accepts or declines directly from My Team. No invitation email is required.": '队长填写成员的唯一昵称 ID 并指定角色；受邀成员直接在“我的队伍”页面接受或拒绝，不需要通过邀请邮件操作。',
    'a user applies with a team ID; the captain approves or rejects. Pending applications may be resubmitted or withdrawn.': '用户使用队伍 ID 提交申请，由队长通过或拒绝。待处理的申请可重新提交或撤回。',
    'one effective captain is always retained. The successor must have verified representative authority and explicitly confirm before the former captain may leave.': '每支队伍必须始终保留一名有效队长。接任成员需先通过代表权限核验并明确确认接任，原队长才能退出。',
    'leaving, removal or demotion takes effect on later web, API and CLI/Skill requests. Historical submissions, attribution and audit records remain.': '退出、移除或降权后，后续的网页、API 和 CLI/Skill 请求会立即按新权限校验。历史提交、署名和审计记录仍会保留。',
    'Captain transfer:': '队长转交：', 'Immediate enforcement:': '权限变更立即生效：',

    'Choose an organizer-approved model registered to your team. Each model and version remains attributable to its submitting member and participating entity.': '请选择已登记在当前队伍名下、且已通过主办方审核的模型。每个模型和版本都会记录对应的提交成员和参评队伍。',
    'Policy Track: upload complete prediction videos on policy-rollout actions. AgiBot G2 only; PO / KRO / IA / MVC where supported.': '策略赛道：请上传基于策略轨迹动作生成的完整预测视频。当前仅支持 AgiBot G2，评测 PO、KRO、IA，以及在模型支持多视角时评测 MVC。',
    'Approved Team Model': '已审核的队伍模型', 'Team captains register models; organizers verify ownership or authorization before submission.': '队长负责登记模型，主办方会在提交前核验模型所有权或授权关系。',
    'Anything you want the organizers to know about this submission.': '如果有需要主办方了解的补充信息，请在此填写。',
    'One ZIP containing the preview-2 manifest, README, and the materials for .': '请上传一个 ZIP，其中包含 preview-2 格式的 manifest、README 和当前赛道所需材料。',
    'Choose Your Package': '选择提交包', 'Confirmed upload progress': '已确认的上传进度', 'Pause Upload': '暂停上传', 'Cancel Upload': '取消上传',
    'Keep Current Package and Continue →': '保留当前提交包并继续 →',
    'The server runs the selected Track’s admission checks, including video headers and first-frame decoding in private temporary storage. Uploaded code is never executed. Passing checks allows final submission to enter the evaluation queue; it is not score verification.': '服务器会在私有临时空间中执行所选赛道的入队检查，包括视频头信息和首帧解码；不会执行上传的代码。通过检查只表示可以进入评测队列，不代表分数已通过验证。',

    'Submission Details': '提交详情', 'Successful Version': '成功版本', 'Track Submission': '赛道提交编号',
    'Edit Submission →': '编辑提交 →', 'Download Package': '下载提交包', 'Withdraw Submission': '撤回提交',
    'Withdraw this submission? It will no longer be editable. Materials are retained for audit.': '确定撤回该提交吗？撤回后将无法继续编辑，但材料会保留用于审计。',
    'Raise a Dispute': '提交异议', 'Result or process concern': '请说明你对评测结果或流程的疑问', 'Send to Organizers': '发送给主办方',
    'Disputes': '异议记录', 'Resolution:': '处理结果：',

    'Registrations & Teams': '注册与队伍', 'Eligibility Operations': '参评资格管理', 'Account Console': '账号管理',
    'Team Applications': '队伍申请', 'ID / Team': 'ID / 队伍', 'Entity': '参评主体', 'Leader': '负责人',
    'Evidence': '证明材料', 'Status / Quota': '状态 / 额度', 'Review': '审核', 'No team applications.': '暂无队伍申请。',
    'Personal Email Verification': '个人邮箱验证', 'Nickname': '昵称', 'Status': '状态', 'Action': '操作',
    'Verify after manual check': '人工核验后标记为已验证', 'Representative Authority': '代表权限', 'Member': '成员', 'Role': '角色', 'Authority': '代表权限',
    'Revoke': '撤销', 'Verify': '验证', 'No active members.': '暂无在队成员。', 'Model Review': '模型审核', 'Relationship': '归属 / 授权关系',
    'Submission Disputes': '提交异议', 'Team / Submitter': '队伍 / 提交人', 'Concern': '异议内容', 'Resolution': '处理结果',
    'Organizer resolution': '请填写主办方的处理结果', 'Resolve': '标记为已处理', 'Reopen': '重新打开', 'No submission disputes.': '暂无提交异议。',
    'Private Workspace': '内部工作区', 'Restricted to official operators.': '仅限授权运营人员访问。', 'Changes are recorded for audit.': '所有变更都会留存审计记录。',
    '/ Operations': '/ 运营后台', 'Organizer Access Only': '仅限主办方访问',
    'Private operations · Evaluation updates require an operator or trusted worker report.': '内部运营后台 · 评测状态仅能由授权运营人员或可信工作进程更新。',
    'Metric Evaluation Progress': '指标评测进度', 'Metric evaluation progress': '指标评测进度',
    'Legacy Score (Modern Scores Are Computed)': '历史分数（新版分数由系统自动计算）', 'Track / Duration': '赛道 / 时长',
    'Metrics [PO, KRO, IA, MVC, Reserved]': '指标 [PO, KRO, IA, MVC, 保留字段]',
    'Single-View Score uses PO/KRO/IA for Main and Long-Horizon, and KRO/IA for Policy. Multi-View Score adds MVC with equal weight. The fifth stored value is retained only for legacy-data compatibility and is not displayed.': '主赛道和长时程赛道的单视角总分由 PO、KRO 和 IA 等权计算；策略赛道使用 KRO 和 IA。多视角总分会再等权加入 MVC。第五个存储值仅为兼容历史数据而保留，不会对外显示。',
    'Submission ID, result file, scoring protocol, or reason for this correction.': '请说明提交 ID、结果文件、评分协议，或本次更正的原因。',

    'Approved': '已通过', 'Rejected': '已拒绝', 'Active': '有效', 'Invited': '已邀请', 'Open': '待处理',
    'Captain': '队长', 'Submitter': '提交成员', 'Collaborator': '协作成员', 'private': '不公开', 'visible': '公开',

    // Messages produced by the current registration and team backend.
    'Verify your email before signing in. You can request a new verification email below.': '请先验证邮箱再登录。如果没有收到邮件，可在下方重新发送。',
    'Unable to sign in. Check your official username and password.': '登录失败，请检查昵称 ID 和密码。',
    'Provide a valid email and a unique 3–40 character nickname.': '请填写有效邮箱，并设置 3–40 个字符的唯一昵称。',
    'Use a matching password of 12–256 characters.': '密码需为 12–256 个字符，两次输入必须一致。',
    'Choose a valid identity type and notification language.': '请选择有效的身份类型和通知语言。', 'Choose a valid identity type.': '请选择有效的身份类型。',
    'Check the optional profile URL and field lengths.': '请检查主页链接是否有效，以及各字段是否超出长度限制。',
    'Confirm the registration terms and privacy notice.': '请确认注册条款和隐私说明。', 'That email or nickname is already registered.': '该邮箱或昵称已被注册。',
    'This verification link is invalid or expired.': '该验证链接无效或已过期。', 'Email verified. Sign in to create or join a team.': '邮箱验证完成。现在可以登录并创建或加入队伍。',
    'Verify your email before creating a team.': '创建队伍前请先完成邮箱验证。', 'Provide a valid team name and type.': '请填写有效的队伍名称并选择队伍类型。',
    'Country/region and full institution name are required; the responsible contact must be your verified account email.': '请填写国家/地区和机构全称；负责人邮箱必须与当前账号已验证邮箱一致。',
    'Provide representative authority evidence; optional notes must stay under 4,000 characters.': '请提供代表权限证明；选填说明不得超过 4,000 个字符。',
    'That team name is already registered.': '该队伍名称已被注册。', 'Provide a valid email and invitation role.': '请填写有效邮箱并选择邀请角色。',
    'Provide a valid participant ID and invitation role.': '请填写有效的昵称 ID，并选择邀请角色。',
    'The captain is already a member of this team.': '队长已经是当前队伍成员。',
    'This participant is already an active team member.': '该用户已经是当前队伍成员。',
    'This participant already belongs to another approved team.': '该用户已经属于另一个审核通过的队伍。',
    'Invitation sent in WorldOracle. The participant can accept it from My Team.': '站内邀请已发送，对方可在“我的队伍”页面接受。',
    'Invitation recorded. Email delivery status is available to organizers.': '邀请已记录，主办方可查看邮件投递状态。',
    'Use the invited, verified email account.': '请使用被邀请且已验证的邮箱账号操作。',
    'Use the invited participant account.': '请使用收到邀请的参评者账号操作。',
    'Leave your current approved team before accepting another.': '接受其他队伍前，请先退出当前已审核通过的队伍。',
    'Use a valid team ID after email verification.': '完成邮箱验证后，请输入有效的队伍 ID。',
    'Leave your current approved team before applying to another.': '申请加入其他队伍前，请先退出当前已审核通过的队伍。',
    'Applicant already belongs to an approved team.': '该申请人已属于另一个已审核队伍。', 'Member allocations exceed the team quota.': '成员额度分配总数超过队伍可用额度。',
    'Transfer captain responsibility before leaving.': '请先转交队长职责，再退出队伍。', 'Representative authority has not been verified.': '该成员的代表权限尚未通过核验。',
    'Provide a model name, valid optional URL, and ownership/authorization relationship.': '请填写模型名称和所有权/授权关系；如填写链接，请确保链接有效。',
    'That model is already registered for this team.': '该模型已登记在当前队伍名下。', 'Submit the draft before raising an evaluation dispute.': '草稿尚未正式提交，暂时无法对评测结果提出异议。',
    'Describe the disputed result or process in 10–4,000 characters.': '请用 10–4,000 个字符说明对评测结果或流程的异议。', 'Dispute recorded for organizer review.': '异议已记录，等待主办方处理。',
    'Quota cannot be lower than submissions already used or member quota already allocated.': '队伍额度不能低于已使用的提交次数或已分配给成员的额度。',
    'Record a short resolution before closing the dispute.': '关闭异议前，请填写简要的处理结果。',

    'Physical State': '物理状态', 'Correctness': '正确性', 'Key Interaction': '关键交互', 'Area Fidelity': '区域保真度',
    'Interaction Spatial': '交互空间', 'Alignment': '对齐', 'Multi-View Action': '多视角动作', 'Coherence': '一致性', 'Evaluation': '评测',
    'Legacy': '旧版', 'Unnamed': '未命名', 'Unlimited': '无限制', 'at least': '至少'
  });

  Object.assign(zh, {
    'Model Account': '模型账号', 'Account Center': '账号中心', 'Team Account': '参评账号',
    'Team & Model Registration': '队伍与模型注册', 'One Account.': '一个账号。', 'One Model.': '一个模型。',
    'One Account · One Team · One Model': '一个账号 · 一个队伍 · 一个模型',
    'Register Model Account': '注册模型账号', 'Register a Model Account ↗': '注册模型账号 ↗',
    'Register Team & Model': '注册队伍与模型', 'Verify Email & Pass Review': '验证邮箱并通过审核',
    'Eligibility & Registration': '参评资格与注册', 'Required Registration Information': '注册必填信息',
    'Registration & Review': '注册与审核', 'Certification & Public Status': '认证与公开状态',
    'Submission Limits': '提交限额', 'Integrity & Audit': '完整性与审计',
    'Team Name': '队伍名称', 'Model Name': '模型名称', 'Organization': '所属机构',
    'Registration Email': '注册邮箱',
    'Public Model Materials': '公开模型资料', 'GitHub / Code Repository': 'GitHub／代码仓库',
    'HuggingFace / Inference Weights': 'Hugging Face／推理权重',
    'Paper / Technical Report': '论文／技术报告', 'Supplementary Notes': '补充说明',
    'Register and Verify Email ↗': '注册并验证邮箱 ↗', 'Registered Model': '已登记模型',
    'Public Model Record': '公开模型档案', 'Verification': '审核标识', 'Public Resources': '公开资源',
    'Certified Team': '认证队伍', 'Non-Certified Team': '非认证队伍',
    'Model record ↗': '查看模型档案 ↗',
    'Certification': '认证状态', 'Public status': '公开状态', 'Open-source status': '开源状态', 'Open-source': '开源', 'All teams': '全部队伍',
    'Certified teams': '认证队伍', 'Non-certified teams': '非认证队伍',
    'All models': '全部模型', 'All Models': '全部模型', 'Open Source': '已开源', 'Not Open Source': '未开源',
    'All source states': '全部开源状态', 'Rolling Seven-Day Quota': '滚动 7 天提交额度',
    'Model Materials': '模型资料', 'Save Materials for Review': '保存并提交审核',
    'This account is permanently bound to one organizer-approved team and model. Every version remains attributable to that registered team, organization, and model.': '当前账号固定绑定一个经主办方审核的队伍和模型。此后提交的每个版本都会归属到该队伍、机构和模型名下。',
    'Register a separate team account to submit a different model.': '如需提交其他模型，请另行注册新的队伍账号。',
    'Each account represents one participating team and is permanently bound to one model. The same model may submit multiple versions to Main, Policy and Long-Horizon Tracks. Register a separate account for every different model. One organization may hold several model accounts only when each account names a distinct model.': '每个账号代表一个参评队伍，并固定绑定一个模型。同一模型可在主赛道、策略赛道和长时程赛道提交多个版本；提交不同模型时必须另行注册账号。同一机构可以注册多个账号，但每个账号必须对应不同模型。',
    'Institutional email is preferred.': '优先使用机构邮箱。',
    'Gmail, 163 and other general providers require stronger supporting evidence. Temporary, untraceable, impersonated or duplicate identities are normally rejected.': '使用 Gmail、163 等公共邮箱时，需要补充更充分的身份证明。临时邮箱、无法追溯的身份、冒用身份或重复注册通常不会通过审核。'
    , 'Each account represents one participating team and is permanently bound to one model. The same model may submit versions to Main, Policy and Long-Horizon Tracks.': '每个账号代表一个参评队伍，并固定绑定一个模型。同一模型可以分别向主赛道、策略赛道和长时程赛道提交不同版本。'
    , 'Register → verify email → organizer review → submit.': '注册 → 验证邮箱 → 主办方审核 → 开始提交。'
    , 'New model, new account. Historical submissions remain bound to this account, model name and version.': '如需提交其他模型，请另行注册账号。历史提交始终归属于原账号、模型名称和版本。'
    , 'Read Eligibility & Review Rules ↗': '查看参评资格与审核规则 ↗'
    , 'Public submitting-entity name.': '公开展示的参评主体名称。'
    , 'Protected after approval and cannot be replaced.': '审核通过后锁定，不可替换为其他模型。'
    , 'Public institution or independent-researcher name.': '公开展示的机构全称或独立研究者名称。'
    , 'Public logo shown with the model profile.': '随模型档案公开展示的机构 Logo。'
    , 'Private. Used for verification, review decisions and English notices. Institutional email is preferred.': '不会公开，用于邮箱验证、接收审核结果和英文通知。建议使用机构邮箱。'
    , 'Private review evidence. Official submissions must establish model ownership or authorization.': '不会公开，仅用于审核。以官方名义提交时，须说明模型归属或提交授权。'
    , 'Links must be real, reachable and model-related. A verified GitHub or paper qualifies the team for certification. A verified GitHub, HuggingFace or paper qualifies the model as public.': '链接必须真实、可访问且与该模型直接相关。GitHub 仓库或论文经核验后，队伍可标记为“认证队伍”；GitHub、Hugging Face 或论文任一项经核验后，模型可标记为“模型已公开”。'
    , 'Open-source status requires both public Code and Weights. Add a valid Code Repository URL to reveal Model Weights. Either field may use any public HTTP/HTTPS host; GitHub and Hugging Face are not required.': '模型只有同时公开代码与权重时才标记为“已开源”。填写并通过格式校验的代码仓库地址后，才会显示模型权重字段。两项均可使用任意公开的 HTTP/HTTPS 地址，不限定 GitHub 或 Hugging Face。'
    , 'Hugging Face / Model Weights': 'Hugging Face／模型权重'
    , 'Any public HTTP/HTTPS code repository URL is accepted.': '支持任意公开的 HTTP/HTTPS 代码仓库地址。'
    , 'Any public HTTP/HTTPS model-weights URL is accepted.': '支持任意公开的 HTTP/HTTPS 模型权重地址。'
    , 'Optional': '选填', 'Optional · private': '选填 · 不公开'
    , 'I accept the registration and participation terms and confirm that all submitted identity and model information is accurate.': '我同意注册与参评条款，并确认填写的主体身份和模型信息真实、准确。'
    , 'I have read the privacy notice and authorize storage of private review information and audit records.': '我已阅读隐私说明，并同意平台保存审核所需的非公开信息和审计记录。'
    , 'Explain why this team is authorized to submit this model.': '请说明本队伍为何有权提交该模型。'
    , 'Model source, authorization relationship, version or reproduction status.': '可补充模型来源、授权关系、版本或复现状态。'
    , '02 / Eligibility & Registration': '02 / 参评资格与注册'
    , '1. Required Registration Information': '1. 注册必填信息'
    , '2. Registration & Review': '2. 注册与审核'
    , '3. Certification & Public Status': '3. 认证与公开状态'
    , '4. Submission Limits': '4. 提交额度'
    , '5. Integrity & Audit': '5. 完整性与审计'
    , 'Public:': '公开信息：', 'team name, model name, organization and organization logo.': '队伍名称、模型名称、所属机构和机构 Logo。'
    , 'Private:': '非公开信息：'
    , 'Optional model materials:': '选填的模型资料：', 'a real model-related GitHub repository, HuggingFace/inference-weight link, paper or technical report, and supplementary provenance/version notes.': '真实且与模型相关的 GitHub 仓库、Hugging Face／推理权重链接、论文或技术报告，以及模型来源／版本补充说明。'
    , 'Register the team account and bound model.': '注册队伍账号，并绑定唯一模型。'
    , 'Verify the registration email using the delivered link.': '通过收到的链接完成邮箱验证。'
    , 'Sign in while the account waits for manual review; formal submission remains locked.': '邮箱验证后可以登录查看审核状态；人工审核通过前不能正式提交。'
    , 'Organizers check email, organization, model ownership and supplied model materials.': '主办方会核验邮箱、所属机构、模型归属和所提供的模型资料。'
    , 'Approval unlocks all three Tracks. Rejection is sent in English with a reason; update the materials and reapply.': '审核通过后可参加全部三条赛道。若未通过，系统会用英文发送原因；补充或修改材料后可重新申请。'
    , 'An approved account may submit even without code or a paper. A verified model-related GitHub repository or public paper/technical report qualifies the account as a': '账号审核通过后，即使暂未公开代码或论文，也可以提交评测。与模型相关的 GitHub 仓库或公开论文／技术报告经核验后，账号会标记为'
    , '. A verified GitHub, HuggingFace or arXiv/paper link qualifies it for the': '。GitHub、Hugging Face 或 arXiv／论文链接任一项经核验后，模型会标记为'
    , 'WorldOracle checks email-domain/organization consistency, repeated domains, duplicate model names and public-resource links, package SHA-256, prediction-video fingerprints and unusual registration/submission frequency. Approved model names are protected against direct reuse. Accounts, materials, versions, risk flags and review actions remain auditable. Organizers may request evidence, suspend submission access or remove results for serious violations.': 'WorldOracle 会检查邮箱域名与机构是否一致、域名是否异常重复、模型名称和公开资料链接是否重复、提交包 SHA-256、预测视频指纹，以及异常的注册或提交频率。已审核模型名称不可被其他账号直接复用。账号、资料、版本、风险标记和审核操作都会保留审计记录；如有严重违规，主办方可要求补充证明、暂停提交权限或移除结果。'
    , 'Register one account for one participating team and one fixed model. After email verification and organizer review, that model can submit multiple versions to Main, Policy, and Long-Horizon Tracks. Open-weight and closed-source approaches may both participate; public resources and certification are disclosed separately on the leaderboard.': '每个参评队伍为一个固定模型注册一个账号。完成邮箱验证并通过主办方审核后，该模型可以向主赛道、策略赛道和长时程赛道提交多个版本。公开权重和闭源方案均可参评；排行榜会分别披露模型资料公开情况与认证状态。'
    , 'An uploaded package is not yet a verified benchmark result. Formal queue entry consumes the rolling quota. A successful V number is assigned only after every required metric passes, and only an improved result replaces the model\'s current leaderboard best.': '上传完成不等于评测结果已经有效。提交正式进入队列时才扣除滚动额度；所有必需指标通过后才会获得成功版本号，且只有更好的成绩会替换该模型当前的榜单最佳结果。'
    , 'The portal automatically uses the single organizer-approved model bound to this account. Select the Track and platform and optionally add submission notes. Each queue entry receives the next account submission number within its Track. V1, V2, and so on are assigned only after successful evaluations; failed attempts never consume a V number.': '提交平台会自动使用当前账号唯一绑定且经主办方审核的模型。您只需选择赛道和平台，并可选填写提交说明。每次正式入队都会在对应赛道中获得新的提交序号；V1、V2 等成功版本号只在评测通过后生成，失败尝试不占用 V 版本号。'
    , 'Track limits and required coverage': '赛道容量与覆盖要求'
    , 'Each prediction entry must include': '每条预测记录必须包含'
    , '. The standard output is H.264 MP4,': '。标准输出格式为 H.264 MP4，像素格式为'
    , ', no audio, source resolution preserved, and the platform\'s native benchmark frame rate. Explain the action-to-frame mapping, whether the initial frame is included, the original resolution, and any unavoidable resampling in': '，不包含音频，保留原始分辨率，并使用该平台的基准原生帧率。请在'
    , 'Required compression profile': '必须遵循的压缩规范'
    , 'Package and verify': '打包与校验'
    , 'Organization Logo': '机构 Logo'
    , 'Replace Organization Logo': '更换机构 Logo'
    , 'More complete information makes approval easier': '信息越完整，越有助于顺利通过审核'
    , 'Required fields': '必填项', 'Supporting materials': '辅助材料', 'required': '必填'
    , 'Upload PNG, JPEG, or WebP, up to 1 MiB. The logo appears on the public model profile.': '请上传 PNG、JPEG 或 WebP 图片，文件不超过 1 MiB。Logo 将展示在公开模型档案中。'
    , 'Any verified public-resource link adds the Public Resources label.': '任一公开资源链接通过核验后，模型将获得“有公开资源”标识。'
    , 'Links must be real, reachable and model-related. A verified GitHub or paper qualifies the team for certification. Any verified public-resource link adds the Public Resources label.': '链接须真实、可访问且与该模型直接相关。GitHub 仓库或论文通过核验后，队伍可获得认证；任一公开资源链接通过核验后，模型将获得“有公开资源”标识。'
    , 'A public link is acceptable.': '可填写公开访问的链接。'
    , 'Model source, version, or reproduction status.': '可补充模型来源、版本或复现状态。'
    , 'Certification & Public Resources': '认证与公开资源'
    , '3. Certification & Public Resources': '3. 认证与公开资源'
    , 'Resource Availability': '公开资源状态', 'All resource states': '全部公开状态'
    , 'All': '全部', 'Certified': '认证', 'Non-certified': '非认证'
    , 'Public': '有公开资源', 'Not public': '暂无公开资源'
    , 'Public Resources': '有公开资源', 'No Public Resources': '暂无公开资源'
    , 'The model name is immutable. Contact organizers if the registered model identity is wrong.': '模型名称不可更改。如登记的模型身份有误，请联系主办方。'
    , 'Add or repair public evidence at any time. Organizers verify resources before certification/resource labels change; existing scores do not need reevaluation.': '您可以随时补充或修正公开材料。主办方核验后才会更新认证和公开资源标识，已有成绩无需重新评测。'
    , 'Leave empty to keep the current logo. PNG, JPEG, or WebP, up to 1 MiB.': '留空则保留当前 Logo。支持 PNG、JPEG 或 WebP，文件不超过 1 MiB。'
    , 'verified registration email, password, accepted registration terms and privacy notice.': '已验证邮箱、密码，以及注册条款和隐私告知的确认记录。'
    , 'Organizers check the email, organization and supplied model materials.': '主办方会核验邮箱、所属机构和提交的模型资料。'
    , 'An approved account may submit even without code or a paper. A verified model-related GitHub repository or public paper/technical report qualifies the account as a': '账号审核通过后，即使暂未公开代码或论文，也可以提交评测。与模型相关的 GitHub 仓库或公开论文／技术报告经核验后，账号会标记为'
    , '. A verified GitHub, HuggingFace or arXiv/paper link adds the': '。GitHub、Hugging Face 或 arXiv／论文链接任一项经核验后，模型会获得'
    , 'label. This means at least one organizer-verified public resource is available; it does not assert an open-source license. Organizers may revoke labels if links fail, resources are unrelated, or submitted artifacts do not match the registered model.': '标识。这表示至少有一项公开资源已经主办方核验，但不代表该模型采用开源许可证。如果链接失效、资料与模型无关，或提交产物与登记模型不一致，主办方可以撤销相应标识。'
    , 'Each approved model account receives a rolling seven-day allowance of 2 formal evaluations per Track and 6 across all three Tracks. Drafts and failed uploads do not consume quota. Quota is consumed when a submission formally enters the evaluation queue. Failures caused by benchmark infrastructure are refunded. Only the best valid version for each model and Track is shown, while every historical version remains in the private account audit.': '每个审核通过的模型账号采用滚动 7 天额度：每个赛道最多正式评测 2 次，三个赛道合计最多 6 次。草稿和上传失败不占额度；提交正式进入评测队列时才计数。由评测基础设施导致的失败会退还额度。每个模型在每个赛道只公开最佳有效版本，但所有历史版本会保留在账号审计记录中。'
    , 'Certification requires an organizer-verified GitHub repository or paper/technical report. “Public Resources” means at least one verified public GitHub, Hugging Face, or paper link is available; it does not assert an open-source license.': '“认证队伍”要求至少有一个经主办方核验的 GitHub 仓库或论文／技术报告。“有公开资源”表示至少存在一个经核验的 GitHub、Hugging Face 或论文链接，但不等同于采用开源许可证。'
    , 'The registration email is private. Public team, model, organization, logo and verified resource labels appear on model records.': '注册邮箱不会公开；队伍名称、模型名称、所属机构、Logo 和经核验的资源标识会展示在模型档案中。'
    , 'Sign-in requires a verified registration email. Formal submission additionally requires organizer approval of the team, model identity and registration materials.': '登录前须完成邮箱验证；正式提交前还需通过主办方对参评队伍、模型身份和注册资料的审核。'
    , 'Upload an organization logo in PNG, JPEG, or WebP format.': '请上传 PNG、JPEG 或 WebP 格式的机构 Logo。'
    , 'The organization logo file is empty.': '机构 Logo 文件为空。'
    , 'The organization logo must be 1 MiB or smaller.': '机构 Logo 文件不得超过 1 MiB。'
    , 'Upload a valid PNG, JPEG, or WebP organization logo.': '请上传有效的 PNG、JPEG 或 WebP 机构 Logo。'
    , 'The organization logo could not be stored. Please try again.': '机构 Logo 保存失败，请重试。'
    , 'Complete all required team, model, organization and email fields.': '请完整填写队伍、模型、所属机构和邮箱等必填项。'
    , 'Provide valid optional material links.': '请检查选填资料链接是否为有效的 HTTP/HTTPS 地址。'
  });

  // Submission-account copy: keep the English interface precise and ensure
  // every visible sentence has a complete, natural Chinese counterpart.
  Object.assign(zh, {
    'Model Account': '提交账号',
    'Submission Account': '提交账号',
    'Create Submission Account': '创建提交账号',
    'Register Model Account': '创建提交账号',
    'Register once.': '一次注册。',
    'Evaluate continuously.': '持续评测。',
    'Each submission account represents one team and one model. Email verification and organizer review protect the leaderboard from unauthorised or unverifiable entries.': '每个提交账号对应一个队伍和一个模型。邮箱验证与主办方审核用于防止未经授权或无法核验的结果进入榜单。',
    'Review-based access': '审核后开放',
    'Account workflow': '账号流程',
    'Registration → email verification → organizer review → submission access.': '注册 → 验证邮箱 → 主办方审核 → 开放提交权限。',
    'Complete public-resource information makes identity and model verification faster.': '公开资料越完整，队伍身份和模型核验越顺利。',
    'Create Submission Account ↗': '创建提交账号 ↗',
    'Register': '注册', 'Verify email': '验证邮箱', 'Organizer review': '主办方审核', 'Submit': '提交',
    'On this page': '本页内容', 'Eligibility': '参评资格', 'Public resources': '公开资料', 'Submission limits': '提交额度', 'Tracks': '赛道',
    'One account, one registered model.': '一个账号对应一个已登记模型。',
    'Create a separate submission account for every model your team enters. Team name, model name, organization, logo and verified email are required. Accounts receive no submission quota until organizer review is complete.': '队伍每提交一个模型，都需要单独创建一个提交账号。队伍名称、模型名称、所属机构、Logo 和已验证邮箱均为必填项；主办方审核通过前，账号不会获得正式提交额度。',
    'More complete information makes approval easier.': '信息越完整，越有利于通过审核。',
    'Use an institutional address where possible and provide public resources that clearly belong to the registered model.': '请尽量使用机构邮箱，并提供能够明确对应已登记模型的公开资料。',
    'Evidence shown clearly on the leaderboard.': '公开资料将在榜单中清晰标注。',
    'GitHub repositories, model weights and papers are optional during registration. Organizers verify each submitted resource before the Certified Team and Public Resources labels are assigned.': '注册时可选填 GitHub 仓库、模型权重和论文。只有在主办方逐项核验后，榜单才会显示“认证队伍”和“有公开资源”标识。',
    'A shared rolling quota.': '统一的滚动提交额度。',
    'After approval, each account may submit up to two evaluations per Track and six evaluations total in a rolling seven-day window. The account may submit new versions of its registered model, but may not switch to a different model identity.': '审核通过后，每个账号在滚动 7 天内，每个赛道最多正式评测 2 次，三个赛道合计最多 6 次。账号可以提交已登记模型的新版本，但不能更换为其他模型。',
    'One account across all eligible Tracks.': '一个账号可参与所有符合条件的赛道。',
    'Standard action-conditioned prediction evaluated on the benchmark protocol.': '按照基准协议评测标准动作条件视频预测。',
    'Policy-rollout distribution using the corresponding paired real executions.': '使用与策略轨迹对应的真实执行进行评测。',
    'Extended prediction windows with multi-segment evaluation.': '面向更长预测窗口进行多片段评测。',
    'Ready to begin?': '准备开始？', 'Create a submission account.': '创建提交账号。', 'Register ↗': '立即注册 ↗',
    'One Registered Model.': '一个已登记模型。',
    'Create one submission account for each model your team enters. After email verification and organizer approval, the registered model can submit multiple versions to every eligible Track.': '每个模型需单独创建一个提交账号。完成邮箱验证并通过主办方审核后，该模型可向所有符合条件的赛道提交多个版本。',
    'Create account → verify email → organizer review → submit.': '创建账号 → 验证邮箱 → 主办方审核 → 开始提交。',
    'Each submission account is tied to one team and one model. Create a separate account for a different model; previous submissions and versions remain attached to the original account.': '每个提交账号仅绑定一个队伍和一个模型。如需提交其他模型，请另行创建账号；已有提交和版本始终归属原账号。',
    'Review Eligibility & Approval Rules ↗': '查看参评资格与审核规则 ↗',
    'Complete information helps us review your application faster': '信息越完整，审核越顺利',
    'Required': '必填',
    'Supporting information': '辅助信息',
    'Public name of the team submitting this model.': '公开展示的模型提交队伍名称。',
    'Public model name. It is locked after approval.': '公开展示的模型名称；审核通过后将锁定。',
    'Public name of the institution, company, or independent researcher.': '公开展示的机构、企业或独立研究者名称。',
    'Upload a PNG, JPEG, or WebP image up to 1 MiB. It will appear on the public model profile.': '请上传不超过 1 MiB 的 PNG、JPEG 或 WebP 图片；该 Logo 将展示在公开模型档案中。',
    'Private. Used to verify the account and send review decisions and service notices. An institutional email is preferred.': '不会公开。用于账号验证，以及接收审核结果和服务通知；建议使用机构邮箱。',
    'Public Model Resources': '公开模型资料',
    'Provide only public, accessible resources that directly describe this model. A verified GitHub repository or paper can qualify the team as Certified; any verified GitHub, Hugging Face, or paper link adds the Public Resources badge.': '请仅填写公开可访问且与该模型直接相关的资料。经核验的 GitHub 仓库或论文可使队伍获得“认证”标识；GitHub、Hugging Face 或论文任一链接通过核验后，模型将获得“有公开资源”标识。',
    'Hugging Face / Model Weights': 'Hugging Face／模型权重',
    'Review Notes': '审核补充说明',
    'Model version, provenance, or reproducibility notes that may help the review.': '可填写有助于审核的模型版本、来源或复现说明。',
    'I accept the registration and participation terms and confirm that the team and model information above is accurate.': '我同意注册与参评条款，并确认上述队伍和模型信息准确无误。',
    'I have read the privacy notice and authorize WorldOracle to store the private information required for account review and auditing.': '我已阅读隐私说明，并同意 WorldOracle 保存账号审核和审计所需的非公开信息。',
    'Create Account & Verify Email ↗': '创建账号并验证邮箱 ↗',
    'This page is hosted on GitHub Pages. Registration data is sent securely to the WorldOracle evaluation service.': '本页面托管在 GitHub Pages；注册数据将通过加密连接发送至 WorldOracle 评测服务。',
    'Registration Received': '注册信息已提交', 'Check your email.': '请查收验证邮件。',
    'Open the verification link within 24 hours.': '请在 24 小时内打开验证链接。',
    'Registration saved. Verify the registered email to enter organizer review.': '注册信息已保存。请验证注册邮箱，完成后将进入主办方审核。',
    'After email verification, your account enters organizer review.': '邮箱验证完成后，账号将进入主办方审核。',
    'Submission access is enabled after approval.': '审核通过后，账号将获得提交权限。',
    'Open the verification link within 24 hours. After verification, the application enters organizer review.': '请在 24 小时内打开验证链接。完成验证后，申请将进入主办方审核。',
    'Return to Project Page': '返回项目主页',
    'Verify your email.': '验证邮箱。',
    'Confirm this address to place the submission account into organizer review. Verification links expire after 24 hours and can be used only once.': '确认邮箱后，提交账号将进入主办方审核。验证链接 24 小时后失效，且只能使用一次。',
    'For safety, verification only happens after you press the button below.': '为避免邮件系统误触发，只有点击下方按钮后才会完成验证。',
    'Verify Email': '验证邮箱', 'Verifying…': '正在验证…', 'Creating account…': '正在创建账号…',
    'Please check the highlighted fields.': '请检查标红字段。',
    'This email is already registered. Sign in or use a different email address.': '该邮箱已注册。请直接登录，或改用其他邮箱地址。',
    'That team name is already registered. Use a different team name.': '该队伍名称已注册，请使用其他队伍名称。',
    'That model name is already registered by a pending or approved account. Use a different model name or contact the organizers.': '该模型名称已被待审核或已通过的账号注册。请使用其他模型名称，或联系主办方核实。',
    'That model name is already registered for this team.': '该模型名称已登记在当前队伍名下。',
    'That team name conflicts with an existing account identifier. Use a different team name.': '该队伍名称与已有账号标识冲突，请使用其他队伍名称。',
    'Another registration was saved at the same time and conflicts with this request. Reload the page and try again.': '提交期间有另一条注册记录同时写入并产生冲突。请刷新页面后重试。',
    'Enter a team name.': '请填写队伍名称。', 'Team name must be 200 characters or fewer.': '队伍名称不能超过 200 个字符。',
    'Enter a model name.': '请填写模型名称。', 'Model name must be 200 characters or fewer.': '模型名称不能超过 200 个字符。',
    'Enter an organization or independent-researcher name.': '请填写所属机构；独立研究者可填写“独立研究者”。',
    'Organization must be 300 characters or fewer.': '所属机构名称不能超过 300 个字符。',
    'Enter a registration email.': '请填写注册邮箱。', 'Enter a valid email address, such as name@example.org.': '请输入有效的邮箱地址，例如 name@example.org。',
    'Use a matching password of 12–256 characters.': '请输入 12–256 个字符的密码，并确保两次输入一致。',
    'Provide valid HTTP/HTTPS links for the GitHub / code repository.': '请输入有效的 GitHub／代码仓库 HTTP 或 HTTPS 链接。',
    'Provide valid HTTP/HTTPS links for the Hugging Face / model weights.': '请输入有效的 Hugging Face／模型权重 HTTP 或 HTTPS 链接。',
    'Provide valid HTTP/HTTPS links for the paper / technical report.': '请输入有效的论文／技术报告 HTTP 或 HTTPS 链接。',
    'Review notes must be 4,000 characters or fewer.': '审核补充说明不能超过 4,000 个字符。',
    'Confirm the registration terms to continue.': '请确认注册与参评条款后继续。', 'Confirm the privacy notice to continue.': '请确认隐私说明后继续。',
    'Upload a PNG, JPEG, or WebP organization logo.': '请上传 PNG、JPEG 或 WebP 格式的机构 Logo。',
    'The organization logo file is empty.': '机构 Logo 文件为空。', 'The organization logo must be 1 MiB or smaller.': '机构 Logo 文件不得超过 1 MiB。',
    'The uploaded logo is too large. Upload an image no larger than 1 MiB.': '机构 Logo 文件过大，请上传不超过 1 MiB 的图片。',
    'Too many registration attempts. Please try again later.': '注册尝试过于频繁，请稍后再试。',
    'Registration could not be completed. Please try again.': '注册未能完成，请稍后重试。',
    'The registration service could not be reached. Check your connection and try again.': '暂时无法连接注册服务，请检查网络后重试。',
    'This verification link is incomplete. Request a new verification email from the sign-in page.': '验证链接不完整，请在登录页面重新发送验证邮件。',
    'This verification link is invalid or expired.': '验证链接无效或已过期。',
    'Email verified. Your submission account is awaiting organizer review.': '邮箱验证成功，提交账号正在等待主办方审核。',
    'The verification service could not be reached. Check your connection and try again.': '暂时无法连接验证服务，请检查网络后重试。',
    'Submit Your Model.': '提交模型。',
    'Track Every Evaluation.': '跟踪每次评测。',
    'Prepare submissions for every eligible Track and follow each evaluation from one workspace.': '在一个工作区准备各赛道的提交，并跟踪每次评测。',
    'Sign-in requires a verified registration email. Formal submission additionally requires organizer approval of the team, model identity and registration information.': '登录前须完成注册邮箱验证；正式提交前，还需通过主办方对队伍、模型身份和注册信息的审核。',
    'New to WorldOracle?': '首次参与 WorldOracle？',
    'Create a submission account': '创建提交账号',
    'Change your password': '修改密码',
    'with your current password. If you forgot it, contact the organizers.': '修改时需要验证当前密码；如已忘记，请联系主办方。',
    'Resend verification email': '重新发送验证邮件',
    'Send verification email': '发送验证邮件',
    'Contributor': '贡献方',
    'Rank by': '排序指标',
    'Leaderboard controls': '排行榜筛选与排序',
    'Policy Track controls': '策略赛道筛选与排序',
    'Loading leaderboard results…': '正在加载排行榜结果…',
    'Six leaderboard metrics on a 0–100 scale. Unsupported metrics are plotted at zero only for display.': '六项排行榜指标，分数范围为 0–100；不支持的指标仅在雷达图中按零绘制。',
    'Click a model in the table to highlight its six-metric profile.': '点击表格中的模型可突出显示其六维指标；再次点击可显示全部模型。'
  });

  const normalize = value => value.replace(/\s+/g, ' ').trim();
  const dynamicZh = [
    [/^Signed in as (.+) · (.+)$/, match => `当前账号：${match[1]} · ${match[2]}`],
    [/^Team #(\d+) · (.+)$/, match => `队伍 #${match[1]} · ${match[2]}`],
    [/^Role: (.+)$/, match => `角色：${translate(match[1])}`],
    [/^(\d+) Records$/, match => `${match[1]} 条记录`],
    [/^Quota (.+)$/, match => `额度 ${match[1]}`],
    [/^A member already belongs to another approved team: (.+)$/, match => `以下成员已属于另一个已审核队伍：${match[1]}`],
    [/^The successor must be an active member with verified representative authority\.$/, () => '接任者必须是当前在队成员，且代表权限已通过核验。'],
    [/^Letter demo ([A-Z]) · (.+) · placeholder only$/, match => `字母演示 ${match[1]} · ${match[2]} · 仅为占位展示`],
    [/^(.+) · WorldOracle$/, match => `${translate(match[1])} · WorldOracle`],
    [/^Step (\d+) · Submit Results$/, match => `第 ${match[1]} 步 · 提交结果`],
    [/^Step (\d+) of 4$/, match => `第 ${match[1]} 步，共 4 步`],
    [/^User: (.+)$/, match => `用户：${match[1]}`],
    [/^Track Submission #(\d+)$/, match => `赛道提交 #${match[1]}`],
    [/^Submission #(\d+) · (.+)$/, match => `提交 #${match[1]} · ${match[2]}`],
    [/^(\d+) submissions · Successful V numbers are maintained independently within each Track\.$/, match => `${match[1]} 次提交 · 成功 V 版本号在每个赛道内独立计数。`],
    [/^Legacy \/ Track Not Selected · (\d+)$/, match => `旧记录 / 未选择赛道 · ${match[1]}`],
    [/^Updated: (.+) · every 1 second$/, match => `更新时间：${match[1]} · 每秒刷新`],
    [/^GPU (\d+) Utilization$/, match => `GPU ${match[1]} 使用率`],
    [/^(\d+(?:\.\d+)?) cores$/, match => `${match[1]} 核`],
    [/^(\d+) cards?$/, match => `${match[1]} 张卡`],
    [/^(\d+) \/ (\d+) episodes$/, match => `${match[1]} / ${match[2]} 条轨迹`],
    [/^(Waiting for Evaluation|Package and Coverage Validation|Physical State Correctness|Interaction Spatial Alignment|Key Interaction Area Fidelity|Multi-View Consistency|Score Aggregation|Legacy Organizer Review|Completed|Failed|Cancelled) · (\d+)%$/, match => `${translate(match[1])} · ${match[2]}%`],
    [/^(\d+)h (\d+)m$/, match => `${match[1]} 小时 ${match[2]} 分钟`],
    [/^(\d+)m (\d+)s$/, match => `${match[1]} 分钟 ${match[2]} 秒`],
    [/^(\d+)s$/, match => `${match[1]} 秒`],
    [/^Track (\d+)$/, match => `赛道 ${match[1]}`],
    [/^Submission ([0-9a-f]{8})$/, match => `提交 ${match[1]}`],
    [/^Submission ([0-9a-f]{8}) · (.+)$/, match => `提交 ${match[1]} · ${translate(match[2])}`],
    [/^(AgiBot G2|YAM|Human Hand) · (30s|Long Horizon) · (\d+) Models$/, match => `${translate(match[1])} · ${translate(match[2])} · ${match[3]} 个模型`],
    [/^(AgiBot G2|YAM|Human Hand) · (30s|Long Horizon) · (\d+) Models · Sorted by (.+)$/, match => `${translate(match[1])} · ${translate(match[2])} · ${match[3]} 个模型 · 按${translate(match[4])}排序`],
    [/^(AgiBot G2|YAM|Human Hand) · (30s|Long Horizon) · All models shown equally\.$/, match => `${translate(match[1])} · ${translate(match[2])} · 所有模型均正常显示。`],
    [/^(AgiBot G2|YAM|Human Hand) · (30s|Long Horizon) · Highlighting (.+)$/, match => `${translate(match[1])} · ${translate(match[2])} · 正在突出显示 ${match[3]}`],
    [/^(Main Track|Policy Track|Long-Horizon Track), (AgiBot G2|YAM|Human Hand)$/, match => `${translate(match[1])}，${translate(match[2])}`],
    [/^(AgiBot G2|YAM|Human Hand) · (30s|Long Horizon) Metric Comparison$/, match => `${translate(match[1])} · ${translate(match[2])}指标对比`],
    [/^Showing (.+) success and failure excerpts\.$/, match => `正在显示“${translate(match[1])}”的成功与失败片段。`],
    [/^(.+) — (Success|Failure) GT Action Excerpt$/, match => `${translate(match[1])} — ${translate(match[2])} GT 动作片段`],
    [/^Highlight (.+)\. Click again to show all models\.$/, match => `突出显示 ${match[1]}。再次点击可显示全部模型。`],
    [/^Highlight (.+) demo radar profile$/, match => `突出显示 ${match[1]} 的演示雷达图`],
    [/^(\d+) metrics on a 0–100 scale\. Unavailable MVC or Policy is plotted at zero only for display\. Demo scores are illustrative\.$/, match => `${match[1]} 项指标，范围为 0–100。不可用的 MVC 或策略评测仅为展示而按零绘制；演示分数仅供说明。`],
    [/^(\d+) metrics on a 0–100 scale\. Unavailable MVAC is plotted at zero only for display\. Scores shown here are verified held-out test-set retest results\.$/, match => `${match[1]} 项指标，分数范围为 0–100。不可用的 MVAC 仅在图中按零绘制；此处显示的是保留测试集上的已核验重测结果。`],
    [/^(\d+) metrics on a 0–100 scale\. Unavailable MVAC is plotted at zero only for display\. Illustrative entries are explicitly labeled as Demo\.$/, match => `${match[1]} 项指标，分数范围为 0–100。不可用的 MVAC 仅在图中按零绘制；演示条目会明确标注为 Demo。`],
    [/^(.+) · (Physical State Correctness|Key Interaction Area Fidelity|Interaction Spatial Alignment|Multi-View Action Coherence|Policy Evaluation): (.+)$/, match => `${match[1]} · ${translate(match[2])}：${translate(match[3])}`],
    [/^(.+) · (KIAF|ISA|MVAC): (.+)$/, match => `${match[1]} · ${match[2]}：${translate(match[3])}`],
    [/^(Gold · 1st|Silver · 2nd|Bronze · 3rd) — (.+)$/, match => `${translate(match[1])} — ${translate(match[2])}`],
    [/^(.+) \(Demo\)$/, match => `${translate(match[1])}（演示）`],
    [/^(.+) · Demo$/, match => `${match[1]} · 演示`],
    [/^(Multi-View|Single-View)( · Layout Demo| · Demo)? · (Certified Team|Non-Certified Team) · (Public Resources|No Public Resources)$/, match => `${translate(match[1])}${match[2] ? ` · ${match[2].includes('Layout') ? '布局演示' : '演示'}` : ''} · ${translate(match[3])} · ${translate(match[4])}`],
    [/^(Multi-View|Single-View)( · Layout Demo| · Demo)$/, match => `${translate(match[1])}${translate(match[2].trim()) === match[2].trim() ? match[2].replace('Layout Demo', '布局演示').replace('Demo', '演示') : ` · ${translate(match[2].trim().slice(2))}`}`],
    [/^(\d+) Models$/, match => `${match[1]} 个模型`],
    [/^(\d+) Records$/, match => `${match[1]} 条记录`],
    [/^Delivery email: (.+)$/, match => `投递邮箱：${match[1]}`],
    [/^Current package: (.+)$/, match => `当前提交包：${match[1]}`],
    [/^Track Checks Passed · (\d+) episodes · (.+) · Not Scored$/, match => `赛道检查已通过 · ${match[1]} 条轨迹 · ${match[2]} · 未评分`],
    [/^Choose a ZIP no larger than (.+) (MiB|GiB)\.$/, match => `请选择不超过 ${match[1]} ${match[2]} 的 ZIP 文件。`],
    [/^Connection interrupted or server busy\. Retrying \((\d+)\/5\)…$/, match => `连接中断或服务器繁忙，正在重试（${match[1]}/5）…`],
    [/^Hashing and uploading verified parts in (\d+) parallel lanes…$/, match => `正在通过 ${match[1]} 路并行连接校验并上传分片…`],
    [/^Verifying local file identity… (\d+)%$/, match => `正在验证本地文件身份… ${match[1]}%`],
    [/^Server Received: (.+)$/, match => `服务器已接收：${match[1]}`],
    [/^Saved upload: (.+)\. Reselect the same ZIP to verify and resume\. Parts are retained for 48 hours after the last successful part\.$/, match => `已保存上传：${match[1]}。请重新选择同一 ZIP 以验证并继续。分片会在最后一个成功分片后保留 48 小时。`],
    [/^Upload request failed \((\d+)\)\.$/, match => `上传请求失败（${match[1]}）。`],
    [/^Upload Failed: (.+) You have not advanced to the next step\. Use Retry Upload to try again\.$/, match => `上传失败：${translate(match[1])} 您尚未进入下一步，请使用“重试上传”再次尝试。`],
    [/^(\d+) processes$/, match => `${match[1]} 个进程`],
    [/^Last measured: (.+) · Refresh interval: 5 seconds$/, match => `最后测量：${match[1]} · 刷新间隔：5 秒`],
    [/^Host logical CPUs: (\d+); service CPU affinity: (\d+)\. Host usage is not normalized to the service CPU allowance\.$/, match => `主机逻辑 CPU：${match[1]}；服务 CPU 亲和数：${match[2]}。主机使用率未按服务 CPU 配额归一化。`],
    [/^Submission (.+) · Status: (.+) · Stage: (.+) · (\d+)%$/, match => `提交 ${match[1]} · 状态：${translate(match[2])} · 阶段：${translate(match[3])} · ${match[4]}%`],
    [/^(.+) · (.+) · (Main Track|Policy Track|Long-Horizon Track|Legacy) · Run #(\d+)$/, match => `${match[1]} · ${match[2]} · ${translate(match[3])} · 运行 #${match[4]}`],
    [/^GPU (.+): (.+) VRAM; SM (.+)$/, match => `GPU ${match[1]}：${match[2]} 显存；SM ${match[3]}`],
    [/^GPU (\d+) · (.+) · Utilization (.+) · VRAM (.+) MiB$/, match => `GPU ${match[1]} · ${match[2]} · 利用率 ${match[3]} · 显存 ${match[4]} MiB`],
    [/^Service Container: CPU (.+) \/ (.+) cores \((.+) of quota\) · Memory (.+) \/ (.+)$/, match => `服务容器：CPU ${match[1]} / ${translate(match[2])} 核（配额占用 ${match[3]}）· 内存 ${match[4]} / ${translate(match[5])}`],
    [/^(.+?) CPU: (.+) · Memory RSS: (.+?) (GPU.+) Disk: (at least )?(.+) \(ZIP \+ managed task files\)$/, match => `${translate(match[1])} CPU：${match[2]} · 内存 RSS：${match[3]} ${translate(match[4])} 磁盘：${match[5] ? '至少 ' : ''}${match[6]}（ZIP + 受管任务文件）`],
  ];
  const languageCookie = () => document.cookie.split('; ').find(item => item.startsWith(COOKIE_KEY + '='))?.split('=').slice(1).join('=');
  const readLanguage = () => {
    let value = languageCookie();
    try { value = value || window.localStorage.getItem(STORAGE_KEY); } catch (_) { /* Storage can be disabled. */ }
    return value === ZH ? ZH : EN;
  };
  let language = readLanguage();

  const sourceText = text => {
    const leading = text.match(/^\s*/)?.[0] || '';
    const trailing = text.match(/\s*$/)?.[0] || '';
    return { leading, core: text.slice(leading.length, text.length - trailing.length), trailing };
  };
  const translate = source => {
    const normalized = normalize(source);
    if (zh[normalized]) return zh[normalized];
    for (const [pattern, replacement] of dynamicZh) {
      const match = normalized.match(pattern);
      if (match) return replacement(match);
    }
    return source;
  };
  const shouldIgnore = node => {
    const element = node.parentElement;
    return !element || Boolean(element.closest('script, style, noscript, code, pre, textarea, .user-text, [data-i18n-skip]'));
  };
  const applyText = node => {
    if (!node.nodeValue || shouldIgnore(node)) return;
    if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
    const original = textOriginals.get(node);
    if (language === EN) { node.nodeValue = original; return; }
    const { leading, core, trailing } = sourceText(original);
    const translated = translate(core);
    node.nodeValue = translated === core ? original : leading + translated + trailing;
  };
  const applyAttributes = element => {
    if (element.closest?.('[data-i18n-skip]')) return;
    const names = ['placeholder', 'title', 'aria-label', 'aria-description', 'data-confirm'];
    if (element.matches?.('meta[name="description"]')) names.push('content');
    let originals = attributeOriginals.get(element);
    if (!originals) { originals = new Map(); attributeOriginals.set(element, originals); }
    names.forEach(name => {
      if (!element.hasAttribute(name)) return;
      if (!originals.has(name)) originals.set(name, element.getAttribute(name));
      const original = originals.get(name);
      element.setAttribute(name, language === ZH ? translate(original) : original);
    });
  };
  const setLocalizedAttribute = (element, name, source) => {
    let originals = attributeOriginals.get(element);
    if (!originals) { originals = new Map(); attributeOriginals.set(element, originals); }
    originals.set(name, source);
    element.setAttribute(name, language === ZH ? translate(source) : source);
  };
  const updateToggle = button => {
    const labels = language === ZH ? ['中文', 'ENG'] : ['ENG', '中文'];
    const current = [...button.children].map(node => node.textContent);
    if (current.length !== 3 || current[0] !== labels[0] || current[1] !== '/' || current[2] !== labels[1]) {
      const primary = document.createElement('span');
      primary.className = 'language-primary';
      primary.textContent = labels[0];
      const divider = document.createElement('span');
      divider.className = 'language-divider';
      divider.setAttribute('aria-hidden', 'true');
      divider.textContent = '/';
      const secondary = document.createElement('span');
      secondary.className = 'language-secondary';
      secondary.textContent = labels[1];
      button.replaceChildren(primary, divider, secondary);
    }
    button.lang = language;
    button.dataset.activeLanguage = language;
    button.setAttribute('aria-label', language === ZH ? '切换到英文' : 'Switch to Chinese');
    button.title = language === ZH ? '切换到英文' : 'Switch to Chinese';
  };
  const updateToggles = root => {
    if (!root) {
      document.querySelectorAll('[data-language-toggle]').forEach(updateToggle);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (root.matches?.('[data-language-toggle]')) updateToggle(root);
    root.querySelectorAll?.('[data-language-toggle]').forEach(updateToggle);
  };
  const apply = root => {
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    const start = root || document.documentElement;
    if (start.nodeType === Node.TEXT_NODE) applyText(start);
    const walker = document.createTreeWalker(start, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) applyText(node);
    if (start.nodeType === Node.ELEMENT_NODE) applyAttributes(start);
    start.querySelectorAll?.('*').forEach(applyAttributes);
    updateToggles(root);
  };
  const persist = value => {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch (_) {}
    document.cookie = `${COOKIE_KEY}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };
  const setLanguage = value => {
    language = value === ZH ? ZH : EN;
    persist(language);
    apply();
    window.dispatchEvent(new CustomEvent('worldoracle:languagechange', { detail: { language } }));
  };
  const localize = source => language === ZH ? translate(source) : source;
  const observe = () => {
    const observer = new MutationObserver(records => {
      if (language !== ZH) return;
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) apply(node);
      }));
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };
  const boot = () => {
    apply();
    observe();
    document.addEventListener('click', event => {
      const button = event.target.closest?.('[data-language-toggle]');
      if (!button) return;
      event.preventDefault();
      setLanguage(language === ZH ? EN : ZH);
    });
    window.addEventListener('storage', event => {
      if (event.key !== STORAGE_KEY || (event.newValue !== EN && event.newValue !== ZH)) return;
      if (event.newValue === language) return;
      language = event.newValue;
      apply();
      window.dispatchEvent(new CustomEvent('worldoracle:languagechange', { detail: { language } }));
    });
  };
  window.WorldOracleI18n = { get language() { return language; }, setLanguage, translate, localize, setLocalizedAttribute };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
