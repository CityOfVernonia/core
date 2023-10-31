/* His name was Bruce McNair. Copyright 2023 City of Vernonia, Oregon. */
import t from"@arcgis/core/PopupTemplate";import{propertyInfoUrl as n,taxMapUrl as r}from"./../support/assessorURLs";export default new t({outFields:["*"],title:"{TAXLOT_ID}",content:t=>{const{TAXLOT_ID:e,ACCOUNT_IDS:a,TAXMAP:i,ADDRESS:l,OWNER:s,ACRES:c,SQ_FEET:o}=t.graphic.attributes,d=l?`\n        <tr>\n          <th>Address (Primary Situs)</th>\n          <td>${l}</td>\n        </tr>\n      `:"",h=a.split(",").map((t=>`\n          <calcite-link href="${n(t,2023)}" target="_blank">${t}</calcite-link>\n        `));return(new DOMParser).parseFromString(`<table class="esri-widget__table">\n          <tr>\n            <th>Tax lot</th>\n            <td>\n            <calcite-link href="https://vernonia-tax-lot.netlify.app/${e}/" target="_blank">${e}</calcite-link>\n            </td>\n          </tr>\n          <tr>\n            <th>Tax map</th>\n            <td>\n              <calcite-link href="${r(i)}" target="_blank">${i}</calcite-link>\n            </td>\n          </tr>\n          <tr>\n            <th>Owner</th>\n            <td>${s}</td>\n          </tr>\n          ${d}\n          <tr>\n            <th>Area</th>\n            <td>${c} acres&nbsp;&nbsp;${o.toLocaleString()} sq ft</td>\n          </tr>\n          <tr>\n            <th>Tax account(s)</th>\n            <td>\n              ${h.join("&nbsp;")}\n            </td>\n          </tr>\n        </table>`,"text/html").body.firstChild}});