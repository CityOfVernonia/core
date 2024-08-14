/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__awaiter as t,__decorate as i}from"tslib";import{subclass as r,property as e}from"@arcgis/core/core/accessorSupport/decorators";import o from"@arcgis/core/widgets/Widget";import{tsx as n}from"@arcgis/core/widgets/support/widget";import s from"@arcgis/core/widgets/Print/PrintViewModel";import a from"@arcgis/core/rest/support/PrintTemplate";let p=class extends o{constructor(t){super(t),this.printFileName="map_print",this.printFormat="pdf",this.printLayout="letter-ansi-a-landscape",this.printTitle="Map Print",this._printing=!1,this._reader=new FileReader}postInitialize(){const{printServiceUrl:t,view:i,_reader:r}=this;this._printViewModel=new s({printServiceUrl:t,view:i}),r.onload=this._readerOnload.bind(this),r.onerror=this._error.bind(this)}_error(t){console.log(t),this._printing=!1}_print(){return t(this,void 0,void 0,(function*(){const{container:t,printFormat:i,printLayout:r,printTitle:e,_printing:o,_printViewModel:n,_reader:s}=this;if(o)return;let p,c;this._printing=!0,t.loading=!0;try{p=(yield n.print(new a({format:i,layout:r,layoutOptions:{titleText:e}}))).url}catch(t){this._error(t)}if(p){try{c=yield(yield fetch(p)).blob()}catch(t){this._error(t)}c&&s.readAsDataURL(c)}}))}_readerOnload(){const{printFileName:t,printFormat:i,_reader:{result:r}}=this;this._printing=!1;const e=Object.assign(document.createElement("a"),{href:r,download:`${t}.${i}`,style:{display:"none"}});document.body.appendChild(e),e.click(),document.body.removeChild(e)}render(){const{_printing:t}=this,i=t?"Printing":"Print";return n("calcite-action",{icon:"print",loading:t,text:i,onclick:this._print.bind(this)},n("calcite-tooltip",{slot:"tooltip"},i))}};i([e()],p.prototype,"_printing",void 0),p=i([r("cov.components.actions.Print")],p);export default p;