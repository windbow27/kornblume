import{o as I}from"./index-515u-JkB.js";import{o as a,c as n,a as e,t,F as g,r as w,u as T,b as F,d as R,e as b,f as m,w as v,g as O,h as j,i as u,j as z,k as V,l as y,m as E}from"./index-eJRkxOZb.js";const k=[{date:"30/01/2024",description:"• Added Legacy methods to Tracker"},{date:"29/01/2024",description:"• Tracker algorithm was modified. Please let us know if it's working via Comments/Bug Reports"},{date:"28/01/2024",description:"• Added Medicine Pocket banner."},{date:"19/01/2024",description:"• OCR improvements. Added notice for incomplete 10x in Tutorial"},{date:"18/01/2024",description:"• Fixed iOS unable to import images."},{date:"17/01/2024",description:`• Added Kaalaa Baunaa and Shamane banners.
 • Updated 1.3 part 1 Event Shop.`},{date:"16/01/2024",description:"• Added Centurion banner."},{date:"15/01/2024",description:'• Added "Level Up" function where you can consume your warehouse materials to update arcanist to goal status. Try it out by left clicking an arcanist.'},{date:"14/01/2024",description:"• Home UI improvements."},{date:"13/01/2024",description:"• The algorithm for image preprocessing has been modified, requiring observation for evaluation."},{date:"12/01/2024",description:"• Fixed a bug where pity count in summon history is displayed incorrectly when other rarities are present."},{date:"11/01/2024",description:`• Updated ES translations
 • Added Jiu Niangzi, Енисе́й and updated previous missing data.`},{date:"10/01/2024",description:`• Updated KR translations
 • vertin wheel vertin wheel vertin wheel.`},{date:"08/01/2024",description:`• Improved Golden Thread OCR.
 • Tracker UI changes.`},{date:"07/01/2024",description:`• Added French translations thanks to я герой#3673. 
 • Improved Japanese translations thanks to yagochi. 
 • Fixed X turning into 37 and crop problems. 
 • Added 50/50 win/lose indicator.`},{date:"06/01/2024",description:`• Added Spanish translations thanks to mgeshagrath. 
 • Added Russian translations thanks to spun4ik and dagufz37. 
 • Released 1.3 Arcanists.`},{date:"05/01/2024",description:`• Big Summon Tracker Update. 
 • Added Japanese translations thanks to yagochi.`},{date:"04/01/2024",description:`• Added Korean translations thanks to CaptinRegulus.
 • Added Banner Type for Tracker.`},{date:"03/01/2024",description:`• Improved i18n. 
 • Improved Tracker OCR`},{date:"02/01/2024",description:"• Error log for Summon Tracker."},{date:"29/12/2023",description:"• Added more languages! vi-VN, zh-CN, zh-TW have been fully translated. We need your help!"},{date:"28/12/2023",description:`• Summon Tracker out of beta release. 
 • Various UI updates.`},{date:"26/12/2023",description:`• Improved OCR for 5*. 
 • Updated Stage Data and Greedy Method improvements. 
 • Added Ezra Theodore and Desert Flanndel.`},{date:"25/12/2023",description:"• Improved Activity Settings. UI Improvements."},{date:"24/12/2023",description:`• UI Improvements
 • Wilderness output is now considered for calculations.
 • Merry Christmas.`},{date:"23/12/2023",description:`• UI Improvements for goals and crafting list. 
 • Added Goal Button.`},{date:"21/12/2023",description:`• UI Improvements. 
 • Added Goals and Crafting List.`},{date:"20/12/2023",description:`• Yet another warehouse update. 
 • Summon Tracker. Beta. 
 • Added Greedy method to prioritize Purple Materials `},{date:"16/12/2023",description:`• Add names to 1.4 data. UI improvements.
 • Added Activity Settings for Roaring Month and Refills.`},{date:"15/12/2023",description:"• Updated storing. Prior selected data will be corrupted, please head to profile to reset."},{date:"14/12/2023",description:`• Warehouse bug fixes (again), changed t6 resonate materials to casket. Sorry for the inconvenience but please reset your warehouse.
 • Added 6, Spathodea and Ulu. Updated arcanists.json
 • Various bug fixes and UI improvements.`},{date:"12/12/2023",description:"• Optimized farming route, from the help of Fran!"},{date:"05/12/2023",description:"• Added Profile. WIP."},{date:"04/12/2023",description:"• Updated credits, minor bug fixes."},{date:"03/12/2023",description:`• Fixed wrong jsons. Hopefully it is correct now.
 • Soldius. 
 • Added 1.2 event shops. Two buttons, all the items.`},{date:"02/12/2023",description:`• Fixed warehouse, added Tooth Fairy and Changeling to released.
 • Fixed more warehouse bugs, added reset button.
 • Fixed MORE warehouse bugs.`},{date:"01/12/2023",description:"• Warehouse filter is broken, temporary disabled."},{date:"30/11/2023",description:"• Added Warehouse. Fixed wrong Insight levels and unreleased Arcanists"},{date:"29/11/2023",description:"• First release."}],P={class:"list-overlay"},W={class:"custom-modal-big h-2/3 lg:h-1/2 relative"},M={class:"absolute top-0 left-0 right-0 p-4 custom-gradient-gray-blue"},B=e("i",{class:"fas fa-times"},null,-1),N=[B],L={class:"text-white font-bold text-2xl p-2"},H={class:"text-white space-y-5 pt-12 overflow-y-auto h-full"},G={class:"text-sky-300"},K={__name:"HomeChangelogs",emits:{closeOverlay:{type:Function,required:!0}},setup(x,{emit:l}){const r=l,s=()=>{r("closeOverlay")};return(c,h)=>(a(),n("div",P,[e("div",W,[e("div",M,[e("button",{onClick:s,class:"absolute top-5 right-7 text-white"},N),e("h1",L,t(c.$t("changelogs")),1)]),e("ul",H,[(a(!0),n(g,null,w(T(k),(d,_)=>(a(),n("li",{key:_},[e("p",G,t(d.date)+":",1),e("ul",null,[(a(!0),n(g,null,w(d.description.split(`
`),(p,i)=>(a(),n("li",{key:i,class:"text-sm"},t(p),1))),128))])]))),128))])])]))}},q={class:"list-overlay"},X={class:"custom-modal-big h-2/3 lg:h-1/2 relative"},D={class:"absolute top-0 left-0 right-0 p-4 custom-gradient-gray-blue"},Y=e("i",{class:"fas fa-times"},null,-1),J=[Y],Q={class:"text-white font-bold text-2xl p-2"},Z={class:"text-white space-y-5 pt-12 overflow-y-auto h-full"},ee=["href"],te=e("i",{class:"fa-solid fa-link"},null,-1),se={class:"text-sm pl-1"},oe={class:"text-sm"},ae={class:"text-sm"},ne={__name:"HomeResources",emits:{closeOverlay:{type:Function,required:!0}},setup(x,{emit:l}){const r=l,{t:s}=F(),c=()=>{r("closeOverlay")},h=[{name:"Huji wiki",author:"Huji wiki team",comment:s("very-detailed-most-of-the-data-is-from-this-wiki"),link:"https://res1999.huijiwiki.com/wiki/%E9%A6%96%E9%A1%B5"},{name:"必要的记录",author:"Chinese community",comment:s("the-drop-rates-of-farming-stages-are-provided-by-this-sheet"),link:"https://www.kdocs.cn/l/cd5MWeCl5bKw"},{name:"ArkPlanner",author:"Penguine Statistics",comment:s("referred-to-arkplanner-s-farming-route-algorithm-enhanced-with-linear-programming-magic"),link:"https://penguin-stats.io/planner"},{name:"Vanity Cake Reverse 1999",author:"Vanity & Cake",comment:s("spreadsheet-for-a-lot-of-things-insight-iii-levels-are-taken-here"),link:"https://docs.google.com/spreadsheets/d/1qQinxxU_e0-YXwPj5WAd2PgTFksyLwIaHXwEcosUxU0/edit#gid=470385843"},{name:"Vertin Wheel",author:"PG小老弟",comment:s("loading-indicator-vertin-wheel-vertin-wheel-vertin-wheel"),link:"https://weibo.com/1851315674/N36YRc9zw?pagetype=viewer"},{name:"柏林以东",author:"早餐奶猹",comment:s("homescreen-image"),link:"https://www.pixiv.net/en/artworks/110046834"},{name:"Seelie",author:"Gabriel",comment:s("ever-wonder-why-this-looks-like-seelie"),link:"https://hsr.seelie.me/"},{name:"Star Rail Station",author:"Star Rail Station",comment:s("summon-tracker-ideas"),link:"https://starrailstation.com/"},{name:"Schale",author:"lonqie",comment:"cunny uwooghh",link:"https://schale.gg/"}];return(d,_)=>{const p=R("i18n-t");return a(),n("div",q,[e("div",X,[e("div",D,[e("button",{onClick:c,class:"absolute top-5 right-7 text-white"},J),e("h1",Q,t(d.$t("credits")),1)]),e("ul",Z,[(a(),n(g,null,w(h,(i,f)=>e("li",{key:f},[e("a",{href:i.link,target:"_blank",class:"text-sky-300 text-lg"},[te,b(" "+t(i.name),1)],8,ee),e("span",se,[m(p,{keypath:"by-author"},{author:v(()=>[e("span",oe,t(i.author),1)]),_:2},1024)]),e("p",ae,t(i.comment),1)])),64))])])])}}},ie={class:"responsive-spacer overflow-x-hidden"},re={class:"text-center p-2 mb-1"},de=e("h1",{class:"text-5xl lg:text-6xl font-bold text-white pt-2"},"Kornblume",-1),le={class:"text-sm sm:text-lg text-gray-300"},ce={class:"text-xs sm:text-base text-gray-300"},pe={key:0,class:"text-xs sm:text-base text-gray-300"},he=e("i",{class:"fa-solid fa-mobile-screen-button"},null,-1),ue=e("i",{class:"fa-solid fa-bars"},null,-1),me={class:"container mx-auto w-full xl:w-1/2 px-4 aspect-video"},ge={class:"carousel w-full rounded-md"},_e=["href"],fe={class:"aspect-video overflow-hidden rounded-md"},be=["src"],ve={class:"text-white"},we={class:"container mx-auto flex flex-col items-center space"},ye={class:"flex flex-wrap justify-center items-center mb-4 gap-x-4 gap-y-4"},ke=e("i",{class:"fa-solid fa-book"},null,-1),xe=e("i",{class:"fa-solid fa-book"},null,-1),$e={href:"https://forms.gle/vfapSjQmRNn7ChPe8",target:"_blank",class:"btn btn-ghost btn-md custom-gradient-button"},Ae=e("i",{class:"fa-solid fa-rectangle-list"},null,-1),Ce=e("a",{href:"https://github.com/windbow27/Kornblume",target:"_blank",class:"text-2xl lg:text-3xl text-gray-400 hover:text-white"},[e("i",{class:"fab fa-github"})],-1),Se={class:"text-xs opacity-80 mb-2 text-center"},Ie=e("i",{class:"fa-regular fa-star"},null,-1),Re={class:"mb-4 text-center"},Ue={class:"text-xs opacity-80"},Te={class:"text-xs sm:text-base opacity-90 mx-2 mt-2"},Fe={class:"btn btn-ghost btn-sm opacity-90",onclick:"translators.showModal()"},Oe={class:"btn btn-ghost btn-sm opacity-90",onclick:"privacy.showModal()"},je={id:"translators",class:"modal"},ze={class:"modal-box custom-border custom-gradient-gray-blue"},Ve=e("form",{method:"dialog"},[e("button",{class:"btn btn-sm btn-circle btn-ghost absolute right-2 top-2"},"✕")],-1),Ee={class:"pb-3 text-xl font-bold"},Pe=E('<div class="space-y-1"><p><span class="text-info"> Español </span> mgeshagrath </p><p><span class="text-info"> Français </span> я герой#3673 </p><p><span class="text-info"> Deutsch </span></p><p><span class="text-info"> 简体中文 </span> fran </p><p><span class="text-info"> 繁體中文 </span> fran </p><p><span class="text-info"> Tiếng Việt </span> windbow </p><p><span class="text-info"> Indonesia </span></p><p><span class="text-info"> 한국어 </span> CaptinRegulus </p><p><span class="text-info"> 日本語 </span> yagochi </p><p><span class="text-info"> Русский </span> spun4ik &amp; dagufz37 </p></div>',1),We={method:"dialog",class:"modal-backdrop"},Me={id:"privacy",class:"modal"},Be={class:"modal-box custom-border custom-gradient-gray-blue"},Ne=e("form",{method:"dialog"},[e("button",{class:"btn btn-sm btn-circle btn-ghost absolute right-2 top-2"},"✕")],-1),Le={class:"py-4"},He={class:"pb-4"},Ge={method:"dialog",class:"modal-backdrop"},Ke={key:0,class:"overlay"},qe={key:1,class:"overlay"},Xe=e("div",null,null,-1),Qe=O({__name:"HomeView",setup(x){const l=j(),r=u(!1),s=u(!1),c=u(null),h=u(null),d=u(window.innerWidth>=768),_=[{link:"https://www.pixiv.net/en/artworks/110046834",imageUrl:"https://pbs.twimg.com/media/F1XIYQXakAAgrt4?format=jpg&name=4096x4096"}],p=()=>{r.value=!0},i=()=>{s.value=!0},f=()=>{r.value=!1},$=()=>{s.value=!1},A=()=>{d.value=window.innerWidth>=768};return z(()=>{window.addEventListener("resize",A),k[0].date!==l.lastChangelogs&&(p(),l.setLastChangelogs(k[0].date))}),V(()=>{window.removeEventListener("resize",A)}),I(c,f),I(h,$),(o,De)=>{const C=R("i18n-t");return a(),n(g,null,[e("div",ie,[e("div",re,[de,e("p",le,t(o.$t("a-toolsite-and-cornflower-worship-place-for-reverse-1999")),1),e("p",ce,t(o.$t("any-help-sharing-this-tool-would-be-greated-appreciated")),1),d.value?y("",!0):(a(),n("p",pe,[m(C,{keypath:"for-mobile-users-click-top-right-to-start"},{mobile:v(()=>[he]),bars:v(()=>[ue]),_:1})]))]),e("div",me,[e("div",ge,[(a(),n(g,null,w(_,(S,U)=>e("div",{key:U,class:"carousel-item w-full flex items-center justify-center"},[e("a",{href:S.link,target:"_blank"},[e("div",fe,[e("img",{src:S.imageUrl,class:"object-cover w-full h-full"},null,8,be)])],8,_e)])),64))])]),e("footer",ve,[e("div",we,[e("div",ye,[e("button",{onClick:p,class:"btn btn-ghost btn-md custom-gradient-button"},[ke,b(" "+t(o.$t("changelogs")),1)]),e("button",{onClick:i,class:"btn btn-ghost btn-md custom-gradient-button"},[xe,b(" "+t(o.$t("credits")),1)]),e("a",$e,[Ae,b(" "+t(o.$t("comments-bug-reports")),1)])]),Ce,e("p",Se,[m(C,{keypath:"all-contributions-are-welcomed-if-you-enjoy-the-work-please-like-subscribe-and-smash-that-star-button"},{star:v(()=>[Ie]),_:1})]),e("div",Re,[e("p",Ue,t(o.$t("kornblume-is-not-affilated-with-bluepoch-all-images-and-data-belongs-to-their-respective-owners")),1),e("p",Te,t(o.$t("developed-by-windbow-joined-by-zero-day-and-fran")),1),e("button",Fe,t(o.$t("translators")),1),e("button",Oe,t(o.$t("privacy-policy")),1),e("dialog",je,[e("div",ze,[Ve,e("h2",Ee,t(o.$t("translators")),1),Pe]),e("form",We,[e("button",null,t(o.$t("")),1)])]),e("dialog",Me,[e("div",Be,[Ne,e("p",Le,t(o.$t("kornblume-use-google-analytics-to-collect-traffics-most-viewed-pages-in-order-to-improve-kornblume-the-data-is-used-solely-for-that-reason-and-will-never-be-used-for-advertising-purposes")),1),e("p",He,t(o.$t("planner-data-is-stored-locally-on-your-device")),1)]),e("form",Ge,[e("button",null,t(o.$t("")),1)])])])])]),r.value?(a(),n("div",Ke,[m(K,{ref_key:"changelogsRef",ref:c,onCloseOverlay:f},null,512)])):y("",!0),s.value?(a(),n("div",qe,[m(ne,{ref_key:"resourcesRef",ref:h,onCloseOverlay:$},null,512)])):y("",!0)]),Xe],64)}}});export{Qe as default};