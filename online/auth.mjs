import {GameError} from './runtime.mjs';
export function createSupabaseAuthenticator({url,publicKey,store,fetcher=fetch}){
 return async request=>{
  if(!url||!publicKey||!store.key)throw new GameError('SERVICE_NOT_CONFIGURED','游戏云服务尚未配置',503);
  const token=request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];if(!token)throw new GameError('UNAUTHENTICATED','请先登录',401);
  // Remote getUser verifies the signature and identity. The request body and
  // decoded JWT sub never decide which player's canonical state is accessed.
  const response=await fetcher(url.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:publicKey,Authorization:'Bearer '+token}});
  if(!response.ok)throw new GameError('UNAUTHENTICATED','登录已过期，请重新登录',401);
  const user=await response.json();if(!user.id||user.is_anonymous)throw new GameError('ACCOUNT_REQUIRED','请使用正式账号进入共享世界',401);
  let claims;try{claims=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));}catch{throw new GameError('UNAUTHENTICATED','登录凭据无效',401);}
  if(typeof claims.session_id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claims.session_id)||!await store.session(user.id,claims.session_id))throw new GameError('SESSION_REVOKED','登录会话已退出，请重新登录',401);
  return user.id;
 };
}
