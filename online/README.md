# 权威共享世界与私人云档

本目录实现实际服务器命令结算。私人云档允许上传经过原引擎校验的单机进度；共享世界只接受动作和参数，服务器创建新档，并使用真实浏览器数据和 Game 引擎执行建设、研究、运输、成长与普通战斗。玩家提供的资源、时间、战果和用户 ID 不作为共享世界权威。

## 当前运行与部署状态

本地 SQLite 服务、真实注册/登录/刷新/退出、重启持久化、原引擎命令、并发修订与幂等测试已实际运行。Supabase 迁移通过 PGlite 原样 PostgreSQL 执行及服务角色/RLS/RPC 检查。项目创建、远端迁移、Edge 部署、Auth 邮件投递、定时任务与真实网络负载验收须在独立游戏项目中完成。现有房地产项目不复用。PGlite/内存并发测试不等同于一百名真实在线玩家的容量测试。

## 本地启动

```sh
npm run online:build
npm run online:serve
```

本地服务需要 Node 22.13+ 的内置 SQLite；核心 Edge 模块也可在 Node 20 导入测试。服务默认只绑定 `127.0.0.1:8140`，数据库默认写入 `~/.local/share/three-kingdoms/online.sqlite`，位于游戏静态目录外。密码用随机盐和 scrypt 保存，会话凭据仅保存 SHA-256 摘要。它用于本地开发，生产采用 Supabase Auth/Postgres。

游戏账号配置可填项目地址 `http://127.0.0.1:8140`，publishable key 填 `sb_publishable_local_development`，世界 `china-1`。本地密码至少 10 个字符。该开发 key 不用于生产认证，实际访问必须通过注册获得的会话。CORS 默认仅允许本机游戏页面端口 8137。本地服务每 15 秒检查已抵达的共享行军；没有到期行军时不写存档。

## v0.33.0 战争、外交与玩家市场

新增 `shared.declareWar/endProtection/peace`、`shared.setDiplomacy/markOperation/removeOperation` 与 `shared.marketCreate/marketBuy/marketCancel` 命令。玩家攻击参数增加 `purpose: raid|occupy` 与 `returnAfterOccupy`。新玩家保护72小时；个人宣战准备8小时、有效48小时；免战花5000黄金，持续12小时、冷却48小时。保护、同盟和友好关系在派遣及结算时重新检查。只有分城可以易主，主城作为保底；城破将领、援军、在外部队、库存与未履约挂单按原归属处理，不复制资产。

玩家挂单冻结真实卖方库存，部分成交扣买方黄金，服务端生成有距离和抵达时间的商队；抵达才交货并支付卖方。订单版本、玩家修订、商队状态及城市归属使用同一事务与幂等回执，取消仅退未售余量；交货和退款允许超仓。确认响应携带本事务的公开世界投影，及时显示余量、商队和外交变化。联盟名城摘要聚合成员领土，进攻名城的下级辖区条件仍按玩家个人拥有判断。

新伤兵进入所属城医院并通过黄金治疗回驻军；守城使用冻结战术。薪俸、民心/断粮及主动城务事件按真实小时结算，共享迁移从当前时间开始，不追缴旧档。完整试玩参数见 [当前规则](../RULES.md)，必要验收见 [v0.33.0记录](../production/qa/original-systems-v0.33.0.md)。本地验证不代表正式云服已经开放。

## 独立 Supabase 项目

CLI 固定使用 2.119.0。两份迁移分别由 `supabase migration new realm_online_v028` 与 `supabase migration new realm_war_market_v033` 创建；部署需按时间顺序应用全部迁移，SQL验收脚本同样执行全部文件。

```sh
node scripts/build-online-runtime.cjs
supabase link --project-ref YOUR_GAME_PROJECT_REF
supabase db push
supabase functions deploy game-api
supabase functions deploy game-tick
```

部署前检查 Auth 的站点地址、邮箱确认和密码要求。浏览器只配置项目 URL 与 publishable key（或旧式 anon key），不配置 secret/service-role key。函数读取 `SUPABASE_URL`、`SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_ANON_KEY` 与 `SUPABASE_SECRET_KEY`/`SUPABASE_SERVICE_ROLE_KEY`。新增 key 通过 `apikey` 使用；secret key 不冒充 JWT。`GAME_ALLOWED_ORIGINS` 为逗号分隔的完整 origin，默认允许 GitHub Pages 和本机 8137。

`game-api` 在函数内部向 Auth `getUser` 验证用户，再检查已验证 JWT 的 `session_id` 是否仍存在于 `auth.sessions`。因此 `verify_jwt=false` 用于兼容新的 API key，并不跳过用户认证。匿名账号不能加入共享世界。

为 `game-tick` 设置至少 32 字符的随机 `GAME_TICK_TOKEN`。将同一值存入 Supabase Vault，命名 `three_kingdoms_tick_token`；仅服务端读取。通过项目 Cron 每分钟 POST `/functions/v1/game-tick`，Authorization 使用 Vault 取出的 Bearer token。需要项目启用 `pg_cron`、`pg_net` 与 Vault；具体项目与权限确认后再配置。示例只含占位 URL，不含真实凭据：

```sql
select cron.schedule('three-kingdoms-arrivals', '* * * * *', $$
  select net.http_post(
    url := 'https://YOUR_GAME_PROJECT_REF.supabase.co/functions/v1/game-tick',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'three_kingdoms_tick_token'
      )
    ),
    body := '{}'::jsonb
  );
$$);
```

玩家也可显式结算抵达部队。定时任务缺失时，行军不会凭空消失：保持到期状态，下次结算继续处理。服务器按真实抵达时间排序，每事务最多处理 8 个事件；战斗与返程按事件时间结算，避免晚登录用后来的建设改变过去的战果。存在未结算抵达时，普通指令返回 `SETTLEMENT_REQUIRED`，客户端需先结算并重读版本。

## API 与事务

一个 POST 入口 `game-api`，Auth Bearer 用户 JWT。请求例：

```json
{"op":"command","realm":"china-1","commandId":"device_cmd_00001","expectedRevision":3,"sourceCity":"capital","type":"train","args":["archer",30]}
```

`op`：`state`、`world`、`create-realm`、`command`、`private-save`、`private-load`。响应包含 `ok/serverTime/revision/state/world/result`；错误包含 `error.code/message`。Game 命令不带 `Game.` 前缀。其它可用命名空间包括 `hero.*`、`wild.*`、`heritage.*`、`onboarding.*` 和 `war.exchange`。`sourceCity` 必须属于当前用户，缺省为主城。普通命令白名单不包含 reset、importSave、测试补给、setSpeed 或外部忙碌标记。

共享动作：`shared.hunt [{line,general,army}]`、`shared.attackPlayer [{targetId,targetCity,general,army}]`、`shared.aid`（同样参数）、`shared.recallAid [{id}]`、`shared.createAlliance [{name}]`、`shared.joinAlliance [{id}]`、`shared.leaveAlliance [{}]`、`shared.settle [{}]`。`world` 只公开城主、城址、已解锁名将位置、归属、联盟、相关行军与最近 20 份相关战报，不公开敌方城内军队或完整存档。

共享战斗 reducer 使用原 Game 兵种/科技/将领数值与固定出征快照，冻结技能和行军速度。玩家战斗自动推进最多 30 回合，城墙与工事参与防守，援军保留原始归属和出发科技。军队出发即进入服务器 escrow，不能重复使用；驻城援军按原城支付双倍养兵消耗。缴获先从目标扣除，按幸存军队负重装载，返城允许爆仓，只入库一次。战报保存回合击杀、损失与缴获。

数据库事务按 UUID 排序锁定受影响玩家，再按固定顺序锁定名将、城池和行军。玩家 revision、对象 version 与联盟 metadata revision 一起比较，失败整笔回滚。名将每世界只有一个归属行；原地图战斗不能越过已经抵达的共享抓将队伍。新筑城同样通过全局城址唯一约束提交，不能覆盖玩家主城或另一座城；已归属玩家的城市必须通过共享出征攻击。操作 ID 与 payload hash（包含 sourceCity）共同实现幂等；同 ID 不同内容拒绝，重复内容返回原回执。回执版本可能落后于当前进度，客户端不能用旧回执覆盖较新的快照，应重读。

空闲读取投影时间，不递增 revision、不写整档、不广播全部存档。客户端前台每 15 秒读取，操作后立即更新，后台暂停。生产还需按真实写入量设置回执/战报保留期、观测慢查询与 Edge CPU，并验证多连接锁等待、延迟与失败率后决定容量和付费档位。

## 定向验证

```sh
node --test tests/online-auth.test.cjs tests/online-runtime.test.cjs tests/online-local.test.cjs
npm run online:sql-check
```

静态工厂由 `scripts/build-online-runtime.cjs` 按 index 加载顺序生成，每请求局部 Date/Math/storage；不使用运行时 eval/vm，不改全局变量。构建同时复制可审阅的 `online/*.mjs` 到 Edge `_shared/online`，生成文件不能手工修改。核心数据或引擎改变后必须重建再部署。
