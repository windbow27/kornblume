import{q as s,H as i}from"./index-NmtHgKfk.js";const a=s().items;i(()=>{a.length===0&&location.reload()});const r=t=>{const e=a.find(n=>n.Name===t);return e?e.Id:1},c=t=>{const e=a.find(n=>n.Name===t);return e?e.Rarity:6},m=t=>t<=21?1:t<=45?2:t<=63?3:t<=86?4:t<=114?11:t===115?5:t===116?6:t<=119?7:t<=122?8:t<=125?9:t<=128?10:t<=621&&t>=600?12:t<=726&&t>700?13:1,g=t=>{const e=r(t);return e?`images/items/icon/${e}.webp`:""},u=t=>{const e=r(t);return e?`images/items/icon/thumbnails/${e}.webp`:""},f=t=>{const e=c(t);return e?`images/items/border/thumbnails/${e}.webp`:""};function h(t){return`images/items/common/${t==="Oneiric Shop"?1:0}.webp`}function b(t){return`images/items/stage/thumbnails/${m(t)}.webp`}function I(t){return`images/arcanists/icon/${t}.webp`}function p(t){return`images/arcanists/icon/thumbnails/${t}.webp`}function w(t){return`images/arcanists/i0/thumbnails/${t}.webp`}function $(t){return`images/arcanists/i2/${t}.webp`}function P(t){return t=t.toLowerCase(),`images/arcanists/misc/logo-${t}.webp`}function l(t){return t=t.toLowerCase(),`images/arcanists/misc/${t}.webp`}function y(t){return`images/arcanists/misc/bg${t}.webp`}function A(t,e){return`images/arcanists/misc/frequency/${t}_${e}.webp`}export{l as a,y as b,g as c,I as d,p as e,A as f,w as g,h,b as i,$ as j,P as k,u as l,f as m};