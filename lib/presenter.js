export function presenterSettings(profile,env){
  if(profile!==undefined&&profile!=='sandbox'&&profile!=='professional')throw new Error('Unknown presenter profile');
  if(profile==='professional')return {avatarId:'87dff365-543d-46a5-9f5a-524da44675ab',voiceId:'5eb4d957-d822-476f-b542-1c536e836b06',sandbox:false,duration:120};
  if(profile==='sandbox')return {avatarId:'dd73ea75-1218-4ef3-92ce-606d5f7fbc0a',voiceId:env.LIVEAVATAR_VOICE_ID,sandbox:true,duration:60};
  return {avatarId:env.LIVEAVATAR_AVATAR_ID,voiceId:env.LIVEAVATAR_VOICE_ID,sandbox:env.LIVEAVATAR_SANDBOX!=='false',duration:env.LIVEAVATAR_SANDBOX!=='false'?60:120};
}
