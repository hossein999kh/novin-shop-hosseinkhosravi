/* ربات مشتری آزمایشی نوین‌شاپ + سایت جم
   - هر ۳۰ ثانیه برای هر دو فروشگاه یک سفر کامل مشتری و یک خرید دمو ثبت می‌کند.
   - در هر صفحه‌ای (index.html یا free-fire-gems.html) که باز باشد کار می‌کند؛ بین تب‌ها فقط یک تب «رهبر» است.
   - همه‌چیز در کلید جدا و امن‌برای‌هم‌زمانی novin_bot_data نوشته می‌شود و app.js آن را در پنل مدیریت
     (سفارش‌ها، سایت جم، مشتریان، گفت‌وگو، ورود و خروج‌ها، شبیه‌ساز) ادغام می‌کند. */
(()=>{'use strict';
if(window.NovinBot)return;
const DATA='novin_bot_data',EV='novin_simulated_customer_events',EN='novin_sim_customers_enabled',LEAD='novin_bot_leader',SETTINGS='novin_sim_bot_settings';
const settings=()=>{const s=J(SETTINGS,{});return {intervalSeconds:Math.max(30,Math.min(300,Number(s.intervalSeconds)||30)),mainEnabled:s.mainEnabled!==false,gemEnabled:s.gemEnabled!==false};};
const TAB=Math.random().toString(36).slice(2);
const J=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k)||'');return v??d}catch{return d}};
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const NAMES=['مریم','علی','سارا','محمد','آرمان','نیلوفر','رضا','هستی','پریسا','کیان'];
const LAST=['آزمایشی','دمو','تست'];
const SHOP={main:'نوین‌شاپ',gem:'فروشگاه جم'};
const enabled=()=>localStorage.getItem(EN)==='1';
function products(site){
 if(site==='gem'){const ps=J('novin_gem_products',[]).filter(p=>p&&p.published!==false);if(ps.length)return ps.map(p=>({id:p.id||p.productId||p.name,name:p.name||'بسته جم',price:Number(p.price)||0}));return [{id:'sim-gem-100',name:'بسته ۱۰۰ جم',price:150000},{id:'sim-gem-500',name:'بسته ۵۰۰ جم',price:690000}];}
 const st=J('novin_state_v2',{}),ps=(Array.isArray(st.products)?st.products:[]).filter(p=>p&&p.published!==false&&Number(p.stock)!==0);
 if(ps.length)return ps.map(p=>({id:p.id||p.productId||p.name,name:p.name||'محصول',category:p.category||'لوازم جانبی',price:Number(p.price)||0,image:typeof p.image==='string'?p.image:'',images:[...new Set([...(Array.isArray(p.images)?p.images:[]),...(typeof p.image==='string'&&p.image?[p.image]:[])].filter(x=>typeof x==='string'&&/^https?:\/\//i.test(x)))],insuranceEnabled:!!p.insuranceEnabled,insurancePrice:Number(p.insurancePrice)||0,insuranceDescription:p.insuranceDescription||'',insuranceOptions:Array.isArray(p.insuranceOptions)?p.insuranceOptions:[],variants:Array.isArray(p.variants)?p.variants:[]}));
 return [{id:'sim-main-sample',name:'محصول نمونه',price:1000000}];
}
function journey(site,cycleId,t0){
 const catalog=products(site);
 const picked=[...catalog].sort(()=>Math.random()-.5).slice(0,Math.min(catalog.length, catalog.length>1 ? 2+Math.floor(Math.random()*Math.min(3,catalog.length-1)) : 1));
 const chosen=picked.length?picked:[rnd(catalog)];
 const p=chosen[0],category=p.category||'لوازم جانبی',items=chosen.map(x=>{const opts=(x.insuranceOptions||[]);const selected=opts.length&&Math.random()<.55?rnd(opts):null;const variants=Array.isArray(x.variants)?x.variants:[];const variant=variants.length?rnd(variants):null;return {...x,...(variant?{price:Number(variant.price)||Number(x.price)||0,ram:variant.ram,storage:variant.storage,color:variant.color,variantLabel:`رم ${variant.ram} گیگابایت · حافظه ${variant.storage} گیگابایت · ${variant.color}`} :{}),qty:1,quantity:1,...(selected?{insuranceCompanyId:selected.companyId,insuranceCompanyName:selected.companyName||'شرکت بیمه',insurancePrice:Number(selected.price)||0,insuranceDescription:selected.description||'',insurance:true}:{})}}),store=SHOP[site],amount=items.reduce((sum,x)=>sum+(Number(x.price)||0)+(Number(x.insurancePrice)||0),0);
 const name=rnd(NAMES)+' '+rnd(LAST)+' '+(100+Math.floor(Math.random()*900));
 const phone='09'+(site==='gem'?'99':'98')+String(1000000+Math.floor(Math.random()*8999999));
 const jid='JRN-'+cycleId+'-'+(site==='gem'?'G':'N')+'-'+Math.random().toString(36).slice(2,5).toUpperCase();
 const ref='DEMO-'+String(t0).slice(-8)+(site==='gem'?'G':'N');
 const steps=[
  ['ورود آزمایشی',`مشتری ساختگی وارد ${store} شد.`],
  ['مرور صفحه اصلی',`صفحه اصلی و بخش‌های ویژهٔ ${store} بررسی شد.`],
  ['مشاهده دسته‌بندی',`دسته «${category}» و ردیف محصولات آن مرور شد.`],
  ['جست‌وجو و فیلتر',`جست‌وجو و انتخاب ${items.length} محصول مختلف در ${store}.`],
  ['مشاهده جزئیات محصول',`جزئیات و قیمت «${p.name}» مشاهده شد.`],
  ['انتخاب نسخه و رنگ محصول',items.some(x=>x.variantLabel)?`نسخه انتخابی: ${items.filter(x=>x.variantLabel).map(x=>x.variantLabel).join('، ')}؛ قیمت بر اساس همان نسخه محاسبه شد.`:'یک رنگ از گزینه‌های قابل انتخاب بررسی شد.'],
  ['افزودن به علاقه‌مندی','محصول به فهرست علاقه‌مندی آزمایشی افزوده شد.'],
  ['مقایسه محصول','مشخصات محصول برای مقایسه ذخیره شد.'],
  ['فعال‌سازی هشدار قیمت','پیگیری قیمت محصول در حالت آزمایشی فعال شد.'],
  ['مشاهده گالری و مشخصات',`گالری «${p.name}» بررسی شد؛ ${Array.isArray(p.images)?p.images.length:0} لینک تصویر برای این محصول ثبت شده است.`],
  ['ثبت پرسش محصول','یک پرسش آزمایشی درباره محصول ثبت شد.'],
  ['افزودن به سبد آزمایشی',`${items.map(x=>'«'+x.name+'»').join('، ')} به سبد ساختگی افزوده شد.`],
  ['بررسی سبد خرید',`سبد چندمحصولی با ${items.length} قلم و مبلغ ${amount} بررسی شد.`],
  ['بررسی کد تخفیف','بخش کد تخفیف در حالت آزمایشی بررسی شد.'],
  ['ثبت سفارش آزمایشی',`سفارش ${jid} شامل ${items.length} محصول مختلف ثبت شد.`],
  ['رفتن به درگاه دمو','صفحه پرداخت آزمایشی باز شد؛ اطلاعات بانکی واقعی وارد نشد.'],
  ['پرداخت آزمایشی موفق',`رسید ${ref} برای ${items.length} محصول صادر شد؛ پولی جابه‌جا نشد.`],
  ['بررسی پروفایل','پروفایل، اطلاعات حساب و سابقه سفارش‌ها بررسی شد.'],
  ['بررسی کیف پول و امتیاز','کیف پول و باشگاه مشتریان بررسی شد؛ موجودی واقعی تغییر نکرد.'],
  ['بررسی اعلان‌ها','اطلاعیه‌های فروشگاه بررسی شد.'],
  ['پیام به پشتیبانی',`پیام آزمایشی دربارهٔ سفارش ${jid}.`],
  ['ثبت نظر آزمایشی',`نظر ساختگی با امتیاز ${3+Math.floor(Math.random()*3)} از ۵ فقط در گزارش تست ثبت شد.`],
  ['بررسی وضعیت سفارش','پیگیری سفارش و وضعیت تحویل بررسی شد.'],
  ['خروج آزمایشی',`مشتری ساختگی از ${store} خارج شد.`]
 ];
 const avatars=['👩🏻','👨🏻','🧑🏻','👩🏼','👨🏼','🧑🏼','👩🏽','👨🏽'];
 const reviewTexts=['کیفیت محصول خوب بود و تجربه خرید راحتی داشتم.','بسته‌بندی و توضیحات محصول مناسب بود.','قیمت نسبت به امکانات قابل قبول است.','سفارش به‌راحتی ثبت شد؛ ممنون از فروشگاه.','محصول مطابق توضیحات صفحه بود.','پشتیبانی پاسخ‌گو بود و راهنمایی خوبی ارائه کرد.','خرید ساده بود و مراحل سفارش واضح بودند.','از تجربه خرید راضی هستم؛ پیشنهاد می‌کنم.'];
 const supportTexts=[`سلام، درباره وضعیت سفارش ${jid} راهنمایی می‌خواهم.`,`وقت بخیر، لطفاً جزئیات محصول «${p.name}» را توضیح دهید.`,`سلام، می‌خواهم از وضعیت کیف پول آزمایشی خود مطلع شوم.`,`سلام، درباره کد تخفیف و شرایط استفاده سؤال دارم.`,`درود، لطفاً درباره بیمه آزمایشی این سفارش راهنمایی کنید.`,`سلام، رسید دمو ثبت شده؛ لطفاً سفارش را بررسی کنید.`];
 return {site,p,category,items,amount,name,phone,jid,ref,steps,t0,avatar:rnd(avatars),reviewText:rnd(reviewTexts),supportText:rnd(supportTexts),rating:3+Math.floor(Math.random()*3)};
}

function syncGemOrderToStore(order){
 // سفارش دمو ربات جم را در همان مخزن سفارش‌های سایت ذخیره می‌کنیم تا پنل سفارش‌های جم هم آن را بخواند.
 if(!order||!(order.type==='freefire_topup'||order.game==='Free Fire')||!order.bot)return false;
 try{
  const state=J('novin_state_v2',{});
  if(!Array.isArray(state.orders))state.orders=[];
  if(!state.orders.some(o=>String(o.id)===String(order.id)||String(o.number)===String(order.number))){
   state.orders.unshift(order);
   if(state.orders.length>3000)state.orders=state.orders.slice(0,3000);
   state.savedAt=Date.now();
   localStorage.setItem('novin_state_v2',JSON.stringify(state));
   window.dispatchEvent(new CustomEvent('novin-gem-order-synced',{detail:{id:order.id,number:order.number}}));
   return true;
  }
 }catch(e){console.warn('Gem demo order sync failed',e);}
 return false;
}

function runCycle(){
 const cfgNow=settings();if(!cfgNow.mainEnabled&&!cfgNow.gemEnabled)throw new Error('هیچ فروشگاهی برای شبیه‌سازی انتخاب نشده است.');
 const now=Date.now(),cycleId=now.toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,5).toUpperCase();
 const data=J(DATA,{});['orders','activity','customers','messages','botProfiles','insuranceRecords','reviews','walletTransactions'].forEach(k=>{if(!Array.isArray(data[k]))data[k]=[];});
 const events=[];let created=0,steps=0;
 const cfg=settings(),sites=['main','gem'].filter(site=>site==='main'?cfg.mainEnabled:cfg.gemEnabled);
 for(const site of sites){
  const j=journey(site,cycleId,now),isGem=site==='gem';
  if(!isGem)window.NovinProductActions?.browseCategory?.(j.category,{phone:j.phone,name:j.name,time:now+150});
  j.steps.forEach((s,i)=>{
   const time=now+i*250,ev={id:j.jid+'-'+(i+1),journeyId:j.jid,cycleId,time,customer:j.name,phone:j.phone,site,product:j.p.name,action:s[0],detail:s[1],amount:s[0]==='پرداخت آزمایشی موفق'?j.amount:0,simulated:true,bot:true,paymentMode:'demo',sessionState:i===0?'entered':i===j.steps.length-1?'exited':'active'};
   events.push(ev);steps++;
   data.activity.push({id:ev.id,action:`🤖 [ربات · ${SHOP[site]}] ${s[0]} — ${s[1]}`,phone:j.phone,name:j.name,time,bot:true,simulated:true,site});
  });
  const previousProfile=data.botProfiles.find(x=>x.phone===j.phone);
  const profile={id:'bot-profile-'+j.phone, name:j.name, phone:j.phone, email:'demo@example.invalid', avatar:j.avatar, bio:'پروفایل مشتری آزمایشی نوین‌شاپ؛ اطلاعات هویتی واقعی نیست.', city:'آزمایشی', address:'نشانی واقعی ثبت نشده', verified:previousProfile?.verified===true, verificationStatus:previousProfile?.verificationStatus||'pending (demo)', verificationReviewedAt:previousProfile?.verificationReviewedAt, verificationReviewedBy:previousProfile?.verificationReviewedBy, points:Math.floor(j.amount/100000), walletBalance:Number.isFinite(Number(previousProfile?.walletBalance))?Number(previousProfile.walletBalance):Math.floor(Math.random()*250000), plusSubscription:previousProfile?.plusSubscription||{active:false,plan:'',price:0,purchasedAt:null,orderNumber:'',source:'not-purchased'}, createdAt:previousProfile?.createdAt||now, simulated:true, bot:true, site};
  // خرید اشتراک نوین پلاس توسط ربات؛ فقط وقتی این رویداد خرید رخ می‌دهد در پنل مدیریت ثبت می‌شود.
  if(site==='main' && Math.random()<0.22 && !profile.plusSubscription?.active){
   const plans=[['یک‌ماهه',199000,30],['سه‌ماهه',499000,90],['شش‌ماهه',899000,180],['یک‌ساله',1599000,365]],chosen=rnd(plans),plusNo='BOT-PLUS-'+now.toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,5).toUpperCase(),plusRef='DEMO-PLUS-'+String(now).slice(-8);
   profile.plusSubscription={active:true,plan:chosen[0],price:chosen[1],purchasedAt:now+6*250,expiresAt:now+6*250+chosen[2]*86400000,orderNumber:plusNo,paymentReference:plusRef,paymentGateway:'پرداخت شبیه‌سازی ربات',source:'bot-simulated-purchase',simulated:true};
   data.orders.unshift({id:plusNo,number:plusNo,type:'plus_subscription',plan:chosen[0],customer:{name:j.name,phone:j.phone},items:[{id:'novin-plus-'+chosen[0],name:'اشتراک نوین پلاس · '+chosen[0],qty:1,quantity:1,price:chosen[1]}],total:chosen[1],amount:chosen[1],status:'paid',payment:'demo',paymentGateway:'پرداخت شبیه‌سازی ربات',paymentReference:plusRef,receipt:{number:'BOT-REC-'+String(now).slice(-8),issuedAt:now+6*250,status:'paid',paymentReference:plusRef},createdAt:now+6*250,updatedAt:now+6*250,simulated:true,bot:true,simulationSite:'main',note:'خرید اشتراک توسط ربات آزمایشی؛ هیچ پرداخت واقعی انجام نشده است.'});
   data.activity.unshift({id:'BOT-PLUS-ACT-'+plusNo,action:`🤖 [ربات] خرید اشتراک نوین پلاس ${chosen[0]} · ${chosen[1].toLocaleString('fa-IR')} تومان`,phone:j.phone,name:j.name,time:now+6*250,bot:true,simulated:true,site:'main'});
  }
  // تراکنش‌های کیف پول ربات فقط در دفتر دمو ثبت می‌شوند و با تراکنش‌های واقعی مشتریان مخلوط نمی‌شوند.
  const priorBalance=Number(profile.walletBalance)||0, topup=Math.max(100000,Math.ceil(j.amount/1000)*1000), debit=Math.min(j.amount,priorBalance+topup);
  profile.walletBalance=Math.max(0,priorBalance+topup-debit);
  data.walletTransactions.unshift({id:'BOT-WALLET-TOPUP-'+j.jid,phone:j.phone,name:j.name,site,bot:true,simulated:true,type:'credit',typeLabel:'شارژ کیف پول ربات (دمو)',amount:topup,status:'demo',time:now+5*250,cycleId:j.jid,balanceAfter:priorBalance+topup});
  data.walletTransactions.unshift({id:'BOT-WALLET-ORDER-'+j.jid,phone:j.phone,name:j.name,site,bot:true,simulated:true,type:'debit',typeLabel:'پرداخت سفارش آزمایشی',amount:debit,status:'demo',time:now+8*250,cycleId:j.jid,balanceAfter:profile.walletBalance});
  data.botProfiles=data.botProfiles.filter(x=>x.phone!==j.phone);data.botProfiles.unshift(profile);
  data.customers.push({...profile,postal:'00000000',simulated:true,bot:true,createdAt:now});
  const extraPhone='09'+(isGem?'97':'96')+String(1000000+Math.floor(Math.random()*8999999));
  const extraProfile={...profile,id:'bot-profile-'+extraPhone,name:rnd(NAMES)+' ربات '+(100+Math.floor(Math.random()*900)),phone:extraPhone,email:'demo@example.invalid',createdAt:now+1,simulated:true,bot:true,site,verificationStatus:'pending (demo)'};
  data.botProfiles.unshift(extraProfile);data.customers.push({...extraProfile,postal:'00000000'});
  data.reviews.unshift({id:'BOT-REV-'+j.jid,productId:j.p.id,productName:j.p.name,phone:j.phone,name:j.name,avatar:j.avatar,rating:j.rating,text:'[نظر آزمایشی ربات] '+j.reviewText,pros:'تجربه خرید ساده',cons:'این نظر صرفاً برای آزمایش است',recommend:j.rating>=4,createdAt:now,simulated:true,bot:true,site});
  // ربات همان عملیات تعاملی صفحه جزئیات را در محیط آزمایشی اجرا و نتیجه را جدا از مشتری واقعی ثبت می‌کند.
  if(site==='main'){
  if(!Array.isArray(data.productActions))data.productActions=[];
  const colors=['مشکی','سفید','آبی','خاکستری'];const chosenColor=rnd(colors);
  const productOps=[
   ['انتخاب رنگ محصول',{color:chosenColor}],['افزودن به علاقه‌مندی','افزوده شد'],['مقایسه محصول','به فهرست مقایسه آزمایشی اضافه شد'],
   ['فعال‌سازی هشدار قیمت','پیگیری قیمت آزمایشی فعال شد'],['مشاهده گالری و مشخصات',{imagesViewed:Array.isArray(j.p.images)?j.p.images.length:0,imageUrls:Array.isArray(j.p.images)?j.p.images.slice(0,12):[],tab:'مشخصات'}],
   ['افزودن به سبد آزمایشی',{color:chosenColor,quantity:1}],['ثبت پرسش محصول',`آیا ${j.p.name} گارانتی دارد؟`],
   ['اشتراک‌گذاری محصول','پیوند آزمایشی بررسی شد'],['مشاهده شرایط ارسال و ضمانت','اطلاعات ارسال و بازگشت باز شد'],
   ['مشاهده فروشندگان دیگر','پیشنهاد فروشنده بررسی شد'],['مرتب‌سازی دیدگاه‌ها','جدیدترین و مفیدترین دیدگاه‌ها بررسی شد'],['فیلتر موضوعی دیدگاه‌ها','فیلتر کیفیت و ارزش خرید آزمایش شد'],['رأی به دیدگاه','رأی مفید آزمایشی ثبت شد'],['ثبت دیدگاه محصول','دیدگاه و امتیاز آزمایشی ثبت شد'],['مشاهده پرسش‌ها','پرسش‌ها و پاسخ‌های محصول بررسی شد'],
   ['مشاهده پلن نوین پلاس','پلن اشتراک بررسی شد'],['انتخاب بیمه کالا',j.items.some(x=>x.insurance)?j.items.filter(x=>x.insurance).map(x=>x.insuranceCompanyName+' · '+x.insurancePrice+' تومان').join('، '):'گزینه بیمه بررسی شد؛ خرید بدون بیمه در این چرخه'],['خرید پوشش بیمه آزمایشی',j.items.some(x=>x.insurance)?'بیمه انتخابی به سفارش دمو اضافه شد':'این کالا بدون بیمه سفارش داده شد']
  ];
  productOps.forEach((op,index)=>{const at=now+(18+index)*250,row={id:'BOT-PROD-'+j.jid+'-'+index,action:op[0],productId:j.p.id,productName:j.p.name,detail:op[1],phone:j.phone,name:j.name,createdAt:at,time:at,bot:true,simulated:true,site:'main',journeyId:j.jid};data.productActions.unshift(row);data.activity.push({id:row.id,action:`🤖 [ربات آزمایشی] ${op[0]} · ${j.p.name} · ${typeof op[1]==='string'?op[1]:JSON.stringify(op[1])}`,phone:j.phone,name:j.name,time:at,bot:true,simulated:true,site:'main'});});
  if(!Array.isArray(data.productQuestions))data.productQuestions=[];data.productQuestions.unshift({id:'BOT-Q-'+j.jid,productId:j.p.id,productName:j.p.name,phone:j.phone,name:j.name,text:`آیا ${j.p.name} گارانتی دارد؟`,createdAt:now+25*250,answer:'پاسخ آزمایشی: شرایط گارانتی در مشخصات محصول درج شده است.',bot:true,simulated:true});
  data.productActions=data.productActions.slice(0,3000);data.productQuestions=data.productQuestions.slice(0,2000);
  }
  data.messages.push({id:'botmsg-'+j.jid,from:'customer',text:`[ربات آزمایشی · ${SHOP[site]}] ${j.supportText}`,conversation:isGem?'ff:'+j.phone:'bot:'+j.phone,phone:j.phone,source:isGem?'freefire':'bot',time:now+13*250,simulated:true,bot:true,readByAdmin:false});
  const number=(isGem?'SIM-GEM-':'SIM-NV-')+now.toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,5).toUpperCase();
  const orderItems=j.items.map((x,index)=>({id:(isGem?'sim-gem-':'sim-main-')+cycleId+'-'+index,productId:x.id,originalProductId:x.id,name:x.name+' (آزمایشی)',qty:x.qty||1,quantity:x.qty||1,price:Number(x.price)||0,...(x.insurance?{insurance:true,insured:true,insuranceCompanyId:x.insuranceCompanyId,insuranceCompanyName:x.insuranceCompanyName,insurancePlan:x.insuranceCompanyName,insuranceDescription:x.insuranceDescription||'',insuranceDecision:'pending',insuranceStatus:'در انتظار صدور بیمه',insurancePrice:Number(x.insurancePrice)||0}:{insuranceRequested:false})}));
  const createdOrder={id:number,number,type:isGem?'freefire_topup':'simulated_bot',game:isGem?'Free Fire':undefined,customer:{name:j.name,phone:j.phone,email:'demo@example.invalid',address:'سفارش آزمایشی - ارسال واقعی ندارد',city:'آزمایشی',postal:'00000000'},items:orderItems,total:j.amount,amount:j.amount,status:'paid',payment:'demo',paymentGateway:'Demo Simulator',paymentReference:j.ref,receipt:{number:'DEMO-REC-'+String(now).slice(-8),issuedAt:now,status:'paid',paymentReference:j.ref},createdAt:now+7*250,updatedAt:now+9*250,timeline:[{status:'pending',at:now+7*250,note:'سفارش آزمایشی توسط ربات ثبت شد'},{status:'paid',at:now+9*250,note:'پرداخت دمو تأیید شد (بدون تراکنش واقعی)'}],simulated:true,bot:true,simulationCycleId:cycleId,simulationSite:site,note:'سفارش ساختگی تولیدشده توسط ربات؛ پرداخت و تحویل واقعی انجام نشده است.',playerId:isGem?'SIM-'+Math.floor(100000000+Math.random()*899999999):''};
  data.orders.unshift(createdOrder);
  if(isGem)syncGemOrderToStore(createdOrder);
  orderItems.forEach((item,index)=>{if(item.insurance){data.insuranceRecords.unshift({id:'BOT-INS-'+j.jid+'-'+index,customerName:j.name,phone:j.phone,productName:String(item.name||'محصول').replace(' (آزمایشی)',''),productId:item.originalProductId,companyId:item.insuranceCompanyId||'',companyName:item.insuranceCompanyName||'شرکت بیمه',plan:item.insuranceCompanyName||'بیمه کالا',orderNumber:number,cycleId,decision:'pending',status:'در انتظار صدور بیمه',createdAt:now,simulated:true,bot:true,site,insuranceEnabled:true,insurancePrice:Number(item.insurancePrice)||0});}});
  created++;
 }
 data.orders=data.orders.slice(0,3000);data.activity=data.activity.slice(-1500);data.customers=data.customers.slice(-500);data.messages=data.messages.slice(-500);data.botProfiles=data.botProfiles.slice(0,500);data.walletTransactions=data.walletTransactions.slice(0,2000);data.insuranceRecords=data.insuranceRecords.slice(0,1000);data.reviews=data.reviews.slice(0,1000);data.updatedAt=Date.now();
 const log=[...events.reverse(),...J(EV,[])].slice(0,1500);
 try{localStorage.setItem(DATA,JSON.stringify(data));localStorage.setItem(EV,JSON.stringify(log));}catch(e){console.warn('Bot storage failed',e);}
 window.dispatchEvent(new CustomEvent('novin-bot-updated'));
 return {id:cycleId,journeys:sites.length,steps,ordersCreated:created,action:'چرخه فروشگاه‌های انتخاب‌شده'};
}
function isLeader(){
 const now=Date.now(),l=J(LEAD,null);
 if(!l||l.tab===TAB||now-Number(l.ts||0)>settings().intervalSeconds*1000*1.5){try{localStorage.setItem(LEAD,JSON.stringify({tab:TAB,ts:now}));}catch{}return true;}
 return false;
}
let timer=null;
function tick(){if(!enabled()||!isLeader())return;runCycle();}
function armTimer(){if(timer)clearInterval(timer);timer=setInterval(tick,settings().intervalSeconds*1000);}
function start(){if(!settings().mainEnabled&&!settings().gemEnabled)throw new Error('حداقل یک فروشگاه را برای شبیه‌سازی انتخاب کن.');if(timer)clearInterval(timer);timer=null;localStorage.setItem(EN,'1');window.dispatchEvent(new CustomEvent('novin-bot-status',{detail:{running:true,manual:true,settings:settings()}}));return {running:true,manual:true,settings:settings()};}
function stop(){localStorage.setItem(EN,'0');if(timer)clearInterval(timer);timer=null;try{localStorage.removeItem(LEAD)}catch{}window.dispatchEvent(new CustomEvent('novin-bot-status',{detail:{running:false,settings:settings()}}));return {running:false};}
function configure(next={}){const cfg={...settings(),...next};cfg.intervalSeconds=Math.max(30,Math.min(300,Number(cfg.intervalSeconds)||30));if(!cfg.mainEnabled&&!cfg.gemEnabled)throw new Error('حداقل یک فروشگاه باید فعال باشد.');localStorage.setItem(SETTINGS,JSON.stringify(cfg));return cfg;}
window.addEventListener('beforeunload',()=>{const l=J(LEAD,null);if(l&&l.tab===TAB)try{localStorage.removeItem(LEAD)}catch{}});
window.NovinBot={start,stop,runCycle,configure,getSettings:settings,isEnabled:enabled,tab:TAB};
// اجرای خودکار عمداً غیرفعال است؛ شروع و اجرای هر چرخه فقط با کلیک مدیر انجام می‌شود.
if(timer)clearInterval(timer);timer=null;localStorage.setItem(EN,'0');
})();
