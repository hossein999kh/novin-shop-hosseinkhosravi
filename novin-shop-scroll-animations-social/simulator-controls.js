/* Reliable delegated controls for the customer simulator. */
(()=>{
 'use strict';
 const $=s=>document.querySelector(s);
 const readEvents=()=>{try{const v=JSON.parse(localStorage.getItem('novin_simulated_customer_events')||'[]');return Array.isArray(v)?v:[]}catch{return []}};
 const notify=msg=>{if(typeof window.toast==='function')window.toast(msg);else{const el=$('#toast');if(el){el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)}else alert(msg)}};
 const refresh=()=>{try{if(typeof window.mergeBotData==='function')window.mergeBotData();if(typeof window.renderAdmin==='function')window.renderAdmin('simCustomers');}catch(err){console.error('Simulator refresh:',err)}};
 const configFromForm=()=>({intervalSeconds:Math.max(30,Math.min(300,Number($('#simBotInterval')?.value)||30)),mainEnabled:!!$('#simBotMainEnabled')?.checked,gemEnabled:!!$('#simBotGemEnabled')?.checked});
 document.addEventListener('click',e=>{
  const button=e.target.closest('#saveSimBotSettings,#startSimCustomers,#stopSimCustomers,#runSimCustomerNow,#exportSimCustomerEvents,#clearSimCustomerEvents');
  if(!button)return;
  e.preventDefault();e.stopImmediatePropagation();
  try{
   if(button.id==='saveSimBotSettings'){
    const cfg=configFromForm();if(!cfg.mainEnabled&&!cfg.gemEnabled)throw new Error('حداقل یک فروشگاه را انتخاب کن.');
    if(!window.NovinBot?.configure)throw new Error('فایل ربات بارگذاری نشده است.');
    window.NovinBot.configure(cfg);localStorage.setItem('novin_sim_bot_settings',JSON.stringify(cfg));notify('تنظیمات ربات ذخیره شد.');refresh();return;
   }
   if(button.id==='startSimCustomers'){
    if(!window.NovinBot?.start)throw new Error('فایل ربات بارگذاری نشده است.');
    const cfg=configFromForm();if(!cfg.mainEnabled&&!cfg.gemEnabled)throw new Error('حداقل یک فروشگاه را انتخاب کن.');
    window.NovinBot.configure(cfg);localStorage.setItem('novin_sim_bot_settings',JSON.stringify(cfg));
    window.NovinBot.start();notify('ربات آماده است. برای ساخت مشتری و سفارش، دکمه «اجرای چرخه همین الان» را بزن.');refresh();return;
   }
   if(button.id==='stopSimCustomers'){
    if(!window.NovinBot?.stop)throw new Error('فایل ربات بارگذاری نشده است.');
    window.NovinBot.stop();notify('ربات متوقف شد.');refresh();return;
   }
   if(button.id==='runSimCustomerNow'){
    if(!window.NovinBot?.runCycle)throw new Error('فایل ربات بارگذاری نشده است.');
    const result=window.NovinBot.runCycle();if(typeof window.mergeBotData==='function')window.mergeBotData();
    notify(`چرخه اجرا شد: ${result.steps} مرحله و ${result.ordersCreated} سفارش آزمایشی.`);refresh();return;
   }
   if(button.id==='exportSimCustomerEvents'){
    const events=readEvents();if(!events.length){notify('گزارشی برای خروجی گرفتن وجود ندارد.');return;}
    const rows=[['زمان','مشتری آزمایشی','موبایل','فروشگاه','مرحله','جزئیات','مبلغ دمو'],...events.map(x=>[new Date(x.time||Date.now()).toLocaleString('fa-IR'),x.customer||'',x.phone||'',x.site==='gem'?'فروشگاه جم':'نوین‌شاپ',x.action||'',x.detail||'',x.amount||0])];
    const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='novin-simulation-events.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('فایل گزارش دانلود شد.');return;
   }
   if(button.id==='clearSimCustomerEvents'){
    if(!confirm('گزارش‌های چرخه شبیه‌سازی پاک شوند؟'))return;
    localStorage.setItem('novin_simulated_customer_events','[]');
    const data=(()=>{try{return JSON.parse(localStorage.getItem('novin_bot_data')||'{}')}catch{return {}}})();
    data.activity=Array.isArray(data.activity)?data.activity.filter(x=>!x.bot):[];
    data.orders=Array.isArray(data.orders)?data.orders.filter(x=>!x.bot):[];
    data.productActions=Array.isArray(data.productActions)?data.productActions.filter(x=>!x.bot):[];
    data.productQuestions=Array.isArray(data.productQuestions)?data.productQuestions.filter(x=>!x.bot):[];
    data.messages=Array.isArray(data.messages)?data.messages.filter(x=>!x.bot):[];
    data.customers=Array.isArray(data.customers)?data.customers.filter(x=>!x.bot):[];
    data.botProfiles=[];data.reviews=Array.isArray(data.reviews)?data.reviews.filter(x=>!x.bot):[];
    data.insuranceRecords=Array.isArray(data.insuranceRecords)?data.insuranceRecords.filter(x=>!x.bot):[];
    data.walletTransactions=Array.isArray(data.walletTransactions)?data.walletTransactions.filter(x=>!x.bot):[];
    localStorage.setItem('novin_bot_data',JSON.stringify(data));localStorage.setItem('novin_bot_cleared_at',String(Date.now()));
    notify('گزارش‌ها و داده‌های آزمایشی ربات پاک شدند.');refresh();return;
   }
  }catch(err){console.error('Simulator button failed:',err);notify('عملیات ربات انجام نشد: '+(err?.message||'خطای ناشناخته'));}
 },true);
})();
