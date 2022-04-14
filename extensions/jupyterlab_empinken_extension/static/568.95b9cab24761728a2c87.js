"use strict";(self.webpackChunkjupyterlab_empinken_extension=self.webpackChunkjupyterlab_empinken_extension||[]).push([[568],{568:(t,e,o)=>{o.r(e),o.d(e,{ButtonExtension:()=>a,ClassDemoExtension:()=>g,default:()=>c});var n=o(644),s=o(129),i=o(114);const l={activate:function(t,e){console.log("JupyterLab extension jupyterlab-empinken is activated!"),console.log("YES WE'RE UPDATED 3"),e&&(e.load(l.id).then((t=>{console.log("jupyterlab_empinken_extension settings loaded:",t.composite);const e=document.documentElement,o=()=>{let o=["activity","solution","learner","tutor"];for(let n of o){const o=t.get(n+"_color").composite;e.style.setProperty("--iou-"+n+"-bg-color",o)}};o(),t.changed.connect(o)})).catch((t=>{console.error("Failed to load settings for jupyterlab_empinken_extension.",t)})),t.docRegistry.addWidgetExtension("Notebook",new g(e)),t.docRegistry.addWidgetExtension("Notebook",new a(e)))},id:"jupyterlab_empinken_extension:plugin",autoStart:!0,optional:[n.ISettingRegistry]};class a{constructor(t){this.settingRegistry=t,console.log("constructor"),this.setup_settings()}setup_settings(){Promise.all([this.settingRegistry.load(l.id)]).then((([t])=>{console.log("reading settings"),this.settings=t})).catch((t=>{console.error(t.message)}))}createNew(t){const e=this.settings.get("tagprefix")?this.settings.get("tagprefix").composite.toString():"";var o=new Array;let n;for(n in o.activity={typ:"activity",label:"A",location:10},o.solution={typ:"solution",label:"S",location:11},o.learner={typ:"learner",label:"L",location:12},o.tutor={typ:"tutor",label:"T",location:13},o){const t=n.toString();o[t].enabled=this.settings.get(t+"_button").composite,o[t].render=this.settings.get(t+"_render").composite,o[t].tag=this.settings.get(t+"_tag").composite.toString()}const l=n=>{const s=t.content.activeCell;console.log("in and metadata is "+s.model.metadata);let i=s.model.metadata.get("tags");i||(console.log("setting metadata.."),s.model.metadata.set("tags",new Array),i=s.model.metadata.get("tags"),console.log(" metadata is now "+s.model.metadata)),console.log("continuing with metadata  "+s.model.metadata),console.log("Cell tags at start are: "+i);const l=e+o[n].tag,a="iou-"+n.toString();if(i.includes(l)){console.log("I see "+l);const t=i.indexOf(l,0);t>-1&&i.splice(t,1),s.node.classList.remove(a+"-node")}else console.log("I don't see "+l),i.push(l),s.node.classList.add(a+"-node");console.log("Cell tags are now: "+i)};for(n in o){const s=n.toString();o[s].enabled&&(o[s].button=new i.ToolbarButton({className:"tagger-"+s+"-button",label:o[s].label,onClick:()=>l(s),tooltip:"Toggle "+e+s+" metadata tag on a cell"}),t.toolbar.insertItem(o[s].location,"toggle_"+s+"TagButtonAction",o[s].button))}return new s.DisposableDelegate((()=>{let t;for(t in o)o[t].enabled&&o[t].button.dispose()}))}}class g{constructor(t){this.settingRegistry=t,console.log("constructor"),this.setup_settings()}setup_settings(){Promise.all([this.settingRegistry.load(l.id)]).then((([t])=>{console.log("reading settings"),this.settings=t})).catch((t=>{console.error(t.message)}))}createNew(t){const e=t.content;let o=["activity","solution","learner","tutor"];const n=this.settings.get("tagprefix").composite.toString();var i=new Array,l=new Map;for(let t of o)console.log("Setup on "+t),i[t]=new Array,i[t].render=this.settings.get(t+"_render").composite,i[t].tag=this.settings.get(t.toString()+"_tag").composite.toString(),l.set(i[t].tag,t);return console.log("Tag prefix is "+n),console.log(i),e.modelChanged.connect((t=>{console.log("I think we're changed")})),e.fullyRendered.connect((t=>{console.log("I think we're fullyRendered...(?!)"),function(t){console.log("Checking to see if there are class tags to set on...");for(const e of t.widgets){let t=e.model.metadata.get("tags");if(t)for(let s=0;s<t.length;s++){const a=t[s];if(console.log("I see tag "+a+"(tag_prefix is "+n+")"+a.startsWith(n)),""==n||a.startsWith(n)){const t=a.replace(n,"");let s="";l.has(t)&&(s=l.get(t)),console.log("Tag match on prefix; typ is "+t),console.log("Acceptable type? "+o.includes(t)),s&&i[s].render&&(console.log("Classing tag "+a+"/"+s),e.node.classList.add("iou-"+s+"-node"))}}}}(t)})),new s.DisposableDelegate((()=>{}))}}const c=l}}]);