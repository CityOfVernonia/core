/* His name was Bruce McNair. Copyright 2023 City of Vernonia, Oregon. */
import t from"@arcgis/core/PopupTemplate";export default new t({outFields:["*"],title:t=>{const{graphic:{attributes:{Subdivision:n,SurveyId:e}}}=t;return n||e},content:t=>{const{SurveyType:n,SurveyId:e,SurveyDate:r,FileDate:i,Comments:d,Sheets:h,Subdivision:a,Client:l,Firm:s,SurveyUrl:o}=t.graphic.attributes;return(new DOMParser).parseFromString(`<table class="esri-widget__table">\n        <tr>\n          <th>Id</th>\n          <td>\n            <calcite-link href="${o}" target="_blank">${e} - View PDF</calcite-link>\n          </td>\n        </tr>\n        <tr>\n          <th>Type</th>\n          <td>${n}</td>\n        </tr>\n        <tr style="${a?"":"display: none;"}">\n          <th>Name</th>\n          <td>${a}</td>\n        </tr>\n        <tr>\n          <th>Client</th>\n          <td>${l}</td>\n        </tr>\n        <tr>\n          <th>Firm</th>\n          <td>${s}</td>\n        </tr>\n        <tr>\n          <th>Date</th>\n          <td>${r}</td>\n        </tr>\n        <tr>\n          <th>Filed</th>\n          <td>${i}</td>\n        </tr>\n        <tr>\n          <th>Comments</th>\n          <td>${d}</td>\n        </tr>\n        <tr>\n          <th>Pages</th>\n          <td>${h}</td>\n        </tr>\n      </table>`,"text/html").body.firstChild}});