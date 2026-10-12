import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {SHOW,CAST} from '../pilot/v2/newsroom-r4-plan.mjs';
import {renderFrame} from '../pilot/v2/newsroom-r4-graphics.mjs';

test('R4+ has vivid cobalt/cyan/amber newsroom hierarchy without demo labels',()=>{
 const story=SHOW.scenes.find(s=>s.id==='top_stories');
 const face=renderFrame(story,1.5,16,{globalSeconds:10,audioDuration:16,includePresenterWindow:true});
 const card=renderFrame(story,6.7,16,{globalSeconds:15,audioDuration:16,includePresenterWindow:false});
 assert.ok(face.includes('#1556CA'),'vivid cobalt masthead required');
 assert.ok(face.includes('#05BEE0'),'cyan story accent required');
 assert.ok(face.includes('MARKET WATCH'));
 assert.ok(face.includes('MARKET BRIEF'));
 assert.ok(card.includes('WHAT THE MARKET IS WATCHING'));
 assert.ok(face.includes('LIZA'));
 assert.ok(!card.includes('DEMO DATA')&&!card.includes('AI PRESENTED')&&!card.includes('MARKET DEMO'));
 assert.notEqual(face,card,'graphic takeover must visibly replace long artificial face hold');
});
test('Liza and Lasse frozen, sources fixed, large text and 1080p render remain intact',async()=>{
 assert.equal(CAST.LIZA.lookId,'5ee67ac453c34ffebd71e8eedb47b2fe');
 assert.equal(CAST.LASSE.lookId,'de9f36c26bd841c891489a0c9d6174de');
 const rates=SHOW.scenes.find(s=>s.id==='rates');
 const svg=renderFrame(rates,2,20,{globalSeconds:71,audioDuration:19,includePresenterWindow:false});
 assert.ok(svg.includes('3.75–4.00%'));
 assert.ok(svg.includes('REUTERS')||svg.includes('FEDERAL RESERVE'));
 const metadata=await sharp(Buffer.from(svg)).png().metadata();
 assert.deepEqual([metadata.width,metadata.height],[1920,1080]);
 const later=renderFrame(rates,8,20,{globalSeconds:77,audioDuration:19,includePresenterWindow:false});
 assert.notEqual(svg,later,'ticker and story motion must advance');
});
