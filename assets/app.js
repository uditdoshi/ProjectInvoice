const SEED_C=window.EASYINVOICE_CUSTOMERS||[], SEED_I=window.EASYINVOICE_ITEMS||[];
let C=[];
let I=[];
let INV=[];
function saveMasters(){populate();}
const $=id=>document.getElementById(id); const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(Number(n||0));
const COMPANY={name:'SHREE POLYMERS',tagline:'Dealers in: All Kinds of Plastic Raw Material & Commission Agent',phone:'91-22-2863 0543',mobile:'91-93222 30023 / 70216 63807',email:'parag3589@yahoo.com',registered:'103, Mahalaxmi Height CHSL, S.V. Road, Opp. Bal Bharti High School, Kandivali West, Mumbai - 400 067.',admin:'Smita Building, Ram Chandra Lane, Near White House Bunglow, Malad West, Mumbai - 400 064.',gstin:'27AAHPD5562F1ZU',bank:'HDFC BANK - KANDIVALI WEST',account:'50200030638690',ifsc:'HDFC0000419'};
let lines=[]; let selectedCustomer=null, selectedShipping=null, editingId=null;
function isoToday(){return new Date().toISOString().slice(0,10)}
function fy(){let d=new Date(),y=d.getMonth()>=3?d.getFullYear():d.getFullYear()-1;return String(y).slice(-2)+'-'+String(y+1).slice(-2)}
function invoices(){return INV}
function nextNo(){let nums=invoices().filter(x=>x.invoiceNo.endsWith('/'+fy())).map(x=>parseInt(x.invoiceNo)||0);return String(Math.max(0,...nums)+1).padStart(3,'0')+'/'+fy()}
function populate(){ $('customerOptions').innerHTML=C.slice().sort((a,b)=>a.name.localeCompare(b.name)).map((x,i)=>`<option value="${esc(x.name)}" data-i="${i}"></option>`).join('') }
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function customerByName(n){return C.find(x=>x.name.trim().toLowerCase()===n.trim().toLowerCase())||null}
function customerHtml(c){if(!c)return 'Select a customer to fill the details.';return `<strong>${esc(c.name)}</strong><br>${esc([c.address1,c.address2,c.city].filter(Boolean).join(', '))}<br>${c.gstin?`GSTIN: ${esc(c.gstin)}`:'GSTIN not available'}`}
function bindCustomer(){selectedCustomer=customerByName($('customerSearch').value);$('customerDetails').innerHTML=customerHtml(selectedCustomer);$('customerDetails').classList.toggle('empty',!selectedCustomer);calc()}
function bindShipping(){selectedShipping=customerByName($('shippingSearch').value);$('shippingDetails').innerHTML=customerHtml(selectedShipping);$('shippingDetails').classList.toggle('empty',!selectedShipping)}
function addLine(seed={}){lines.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),itemName:seed.itemName||'',description:seed.description||'',hsn:seed.hsn||'',qty:seed.qty||1,rate:seed.rate||0,gst:seed.gst??18});renderLines()}
function renderLines(){ $('lines').innerHTML=lines.map((l,idx)=>`<div class="lineItem" data-id="${l.id}"><label class="desc">Item<input class="item" list="itemOptions${idx}" value="${esc(l.itemName)}" placeholder="Search item"><datalist id="itemOptions${idx}">${I.map(x=>`<option value="${esc(x.description)} — ${esc(x.code)}"></option>`).join('')}</datalist></label><label>Qty<input class="qty" type="number" min="0" step="0.01" value="${l.qty}"></label><label>Rate<input class="rate" type="number" min="0" step="0.01" value="${l.rate}"></label><label>GST %<input class="gst" type="number" min="0" step="0.01" value="${l.gst}"></label><div class="amount">${money(l.qty*l.rate)}</div><button class="remove" title="Remove">×</button></div>`).join('');
 document.querySelectorAll('.lineItem').forEach(el=>{let l=lines.find(x=>x.id===el.dataset.id);el.querySelector('.item').onchange=e=>{let v=e.target.value, it=I.find(x=>(x.description+' — '+x.code)===v)||I.find(x=>x.description===v);if(it){l.materialId=it.id;l.itemName=v;l.description=it.description;l.hsn=it.hsn;l.gst=it.gst_rate;l.rate=Number(it.default_rate||l.rate||0)}else{l.itemName=v;l.description=v}renderLines()};['qty','rate','gst'].forEach(k=>el.querySelector('.'+k).oninput=e=>{l[k]=Number(e.target.value||0);el.querySelector('.amount').textContent=money(l.qty*l.rate);calc()});el.querySelector('.remove').onclick=()=>{lines=lines.filter(x=>x.id!==l.id);if(!lines.length)addLine();else renderLines();calc()}});calc() }
function calc(){let subtotal=0,tax=0;lines.forEach(l=>{let a=Number(l.qty||0)*Number(l.rate||0);subtotal+=a;tax+=a*Number(l.gst||0)/100});let other=Number($('otherCharges').value||0), interstate=selectedCustomer?.gstin&&selectedCustomer.gstin.slice(0,2)!=='27';let cgst=interstate?0:tax/2,sgst=interstate?0:tax/2,igst=interstate?tax:0;let total=subtotal+tax+other;$('subtotal').textContent=money(subtotal);$('cgst').textContent=money(cgst);$('sgst').textContent=money(sgst);$('igst').textContent=money(igst);$('otherTotal').textContent=money(other);$('grandTotal').textContent=money(total);return{subtotal,cgst,sgst,igst,other,total}}
function due(){let d=new Date($('invoiceDate').value+'T00:00:00'),t=$('paymentTerms').value,n=parseInt(t)||0;if(!isNaN(d)){$('dueDate').value=new Date(d.getTime()+n*86400000).toISOString().slice(0,10)}}
const ones=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'],tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
function words(n){n=Math.floor(n);if(n===0)return'Zero';const u100=x=>x<20?ones[x]:tens[Math.floor(x/10)]+(x%10?' '+ones[x%10]:'');const u1000=x=>(x>=100?ones[Math.floor(x/100)]+' Hundred ':'')+u100(x%100);let p=[];[[10000000,'Crore'],[100000,'Lakh'],[1000,'Thousand']].forEach(([d,l])=>{if(n>=d){let q=Math.floor(n/d);n%=d;p.push(words(q)+' '+l)}});if(n)p.push(u1000(n).trim());return p.join(' ')}
function amountWords(v){let r=Math.floor(v),p=Math.round((v-r)*100);return words(r)+' Rupees'+(p?' and '+words(p)+' Paise':'')+' Only'}
function data(){let totals=calc();return{id:editingId||Date.now().toString(),invoiceNo:$('invoiceNo').value.trim(),invoiceDate:$('invoiceDate').value,dueDate:$('dueDate').value,paymentTerms:$('paymentTerms').value,customer:selectedCustomer,shipping:$('sameShipping').checked?selectedCustomer:selectedShipping,lines:lines.filter(l=>l.description&&l.qty>0).map(l=>({...l,amount:l.qty*l.rate})),transporter:$('transporter').value,vehicleNo:$('vehicleNo').value,broker:$('broker').value,lrNo:$('lrNo').value,lrDate:$('lrDate').value,otherCharges:Number($('otherCharges').value||0),notes:$('notes').value,totals,createdAt:new Date().toISOString()}}
function validate(d){if(!d.invoiceNo)return'Enter an invoice number.';if(!d.invoiceDate)return'Select the invoice date.';if(!d.customer)return'Select a customer from the list.';if(!d.lines.length)return'Add at least one item with quantity.';return''}
async function save(show=true){let d=data(),e=validate(d);if(e){alert(e);return null}try{d.id=editingId||null;let saved=await window.EasyDB.saveInvoice(d);let idx=INV.findIndex(x=>String(x.id)===String(saved.id)||x.invoiceNo===saved.invoiceNo);if(idx>=0)INV[idx]=saved;else INV.unshift(saved);editingId=saved.id;if(show)alert('Invoice saved to Supabase.');return saved}catch(err){alert('Could not save invoice: '+err.message);return null}}
function renderInvoice(d){let bill=d.customer||{},ship=d.shipping||bill,t=d.totals;let rows=d.lines.map((l,i)=>`<tr><td class="center">${i+1}</td><td>${esc(l.description)}</td><td class="center">${esc(l.hsn)}</td><td class="right">${l.qty}</td><td class="right">${money(l.rate)}</td><td class="right">${money(l.amount)}</td><td class="right">${l.gst}%</td></tr>`).join('');while((rows.match(/<tr>/g)||[]).length<11)rows+='<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
$('invoicePaper').innerHTML=`<div class="tax-title">TAX INVOICE</div><div class="company-head"><div class="inv-title">${COMPANY.name}</div><div class="inv-tag">${COMPANY.tagline}</div><div class="inv-contact">Phone: ${COMPANY.phone} | Mobile: ${COMPANY.mobile} | Email: ${COMPANY.email}<br>GSTIN: ${COMPANY.gstin}</div></div><table class="inv-table"><tr><td style="width:55%"><b>Bill To:</b><br><b>${esc(bill.name)}</b><br>${esc([bill.address1,bill.address2,bill.city].filter(Boolean).join(', '))}<br>GSTIN: ${esc(bill.gstin||'')}</td><td><b>Invoice No.:</b> ${esc(d.invoiceNo)}<br><b>Date:</b> ${esc(d.invoiceDate)}<br><b>Due Date:</b> ${esc(d.dueDate)}<br><b>Terms:</b> ${esc(d.paymentTerms)}</td></tr><tr><td><b>Ship To:</b><br><b>${esc(ship?.name||'')}</b><br>${esc([ship?.address1,ship?.address2,ship?.city].filter(Boolean).join(', '))}<br>GSTIN: ${esc(ship?.gstin||'')}</td><td><b>Transporter:</b> ${esc(d.transporter)}<br><b>Vehicle:</b> ${esc(d.vehicleNo)}<br><b>Broker:</b> ${esc(d.broker)}<br><b>LR/RR:</b> ${esc(d.lrNo)} ${esc(d.lrDate)}</td></tr></table><table class="inv-table"><thead><tr><th>#</th><th>Description</th><th>HSN</th><th>Qty</th><th>Rate</th><th>Amount</th><th>GST</th></tr></thead><tbody>${rows}</tbody></table><table class="inv-table"><tr><td rowspan="6" style="width:62%"><b>Amount in words:</b><br>${amountWords(t.total)}<br><br><b>Bank:</b> ${COMPANY.bank}<br>A/c: ${COMPANY.account} &nbsp; IFSC: ${COMPANY.ifsc}<br><br>${esc(d.notes)}</td><td>Subtotal</td><td class="right">${money(t.subtotal)}</td></tr><tr><td>CGST</td><td class="right">${money(t.cgst)}</td></tr><tr><td>SGST</td><td class="right">${money(t.sgst)}</td></tr><tr><td>IGST</td><td class="right">${money(t.igst)}</td></tr><tr><td>Other charges</td><td class="right">${money(t.other)}</td></tr><tr><td><b>Grand Total</b></td><td class="right"><b>${money(t.total)}</b></td></tr><tr><td class="inv-footer"><b>Registered Office:</b> ${COMPANY.registered}<br><b>Admin Office:</b> ${COMPANY.admin}</td><td colspan="2" class="signature">For <b>${COMPANY.name}</b><br><br>Authorised Signatory</td></tr></table>`}
function preview(){let d=data(),e=validate(d);if(e){alert(e);return}renderInvoice(d);$('previewModal').hidden=false;document.body.style.overflow='hidden'}
function reset(){editingId=null;selectedCustomer=selectedShipping=null;$('invoiceNo').value=nextNo();$('invoiceDate').value=isoToday();$('paymentTerms').value='CDC';due();['customerSearch','shippingSearch','transporter','vehicleNo','broker','lrNo','lrDate','notes'].forEach(x=>$(x).value='');$('otherCharges').value=0;$('sameShipping').checked=true;$('shippingBox').hidden=true;$('customerDetails').innerHTML='Select a customer to fill the billing details.';$('shippingDetails').innerHTML='Select a shipping address.';lines=[];addLine();calc()}
function showHistory(){ $('editorView').hidden=true;$('historyView').hidden=false;renderHistory() }
function renderHistory(){let q=$('historySearch').value.toLowerCase(),arr=invoices().filter(x=>(x.invoiceNo+' '+(x.customer?.name||'')).toLowerCase().includes(q));$('historyList').innerHTML=arr.length?arr.map(x=>`<div class="row"><div><b>${esc(x.invoiceNo)}</b><div class="muted">${esc(x.invoiceDate)}</div></div><div>${esc(x.customer?.name||'')}</div><div><b>${money(x.totals?.total)}</b></div><div><button class="secondary open" data-id="${x.id}">Open</button></div></div>`).join(''):'<div class="info empty">No saved invoices found.</div>';document.querySelectorAll('.open').forEach(b=>b.onclick=()=>loadInvoice(b.dataset.id))}
function loadInvoice(id){let d=invoices().find(x=>String(x.id)===String(id));if(!d)return;editingId=d.id;$('invoiceNo').value=d.invoiceNo;$('invoiceDate').value=d.invoiceDate;$('dueDate').value=d.dueDate;$('paymentTerms').value=d.paymentTerms;$('customerSearch').value=d.customer?.name||'';bindCustomer();let same=(d.shipping?.name||'')===(d.customer?.name||'');$('sameShipping').checked=same;$('shippingBox').hidden=same;$('shippingSearch').value=same?'':d.shipping?.name||'';bindShipping();lines=d.lines.map(x=>({...x,id:crypto.randomUUID?crypto.randomUUID():String(Math.random())}));renderLines();['transporter','vehicleNo','broker','lrNo','lrDate','notes'].forEach(k=>$(k).value=d[k]||'');$('otherCharges').value=d.otherCharges||0;$('historyView').hidden=true;$('editorView').hidden=false;calc();scrollTo(0,0)}
$('customerSearch').onchange=bindCustomer;$('shippingSearch').onchange=bindShipping;$('sameShipping').onchange=e=>$('shippingBox').hidden=e.target.checked;$('paymentTerms').onchange=due;$('invoiceDate').onchange=due;$('otherCharges').oninput=calc;$('addLine').onclick=()=>addLine();$('previewBtn').onclick=preview;$('saveBtn').onclick=()=>save();$('saveFromPreview').onclick=()=>save();$('printBtn').onclick=()=>window.print();$('closePreview').onclick=()=>{$('previewModal').hidden=true;document.body.style.overflow=''};$('clearBtn').onclick=()=>{if(confirm('Clear the current invoice?'))reset()};$('historyBtn').onclick=()=>showView('historyView');$('newBtn').onclick=()=>{$('historyView').hidden=true;$('editorView').hidden=false;reset()};$('historySearch').oninput=renderHistory;


// ----- Master data management -----
let editingCustomerId=null, editingItemId=null;
const views=['editorView','historyView','customersView','itemsView','backupView'];
function showView(id){views.forEach(v=>$(v).hidden=v!==id);if(id==='historyView')renderHistory();if(id==='customersView')renderCustomerManager();if(id==='itemsView')renderItemManager();if(id==='backupView')renderBackupSummary();scrollTo(0,0)}
function cleanText(v){return String(v||'').trim()}
function renderCustomerManager(){let q=cleanText($('customerManagerSearch').value).toLowerCase();let arr=C.filter(c=>[c.name,c.city,c.gstin].join(' ').toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name));$('customerManagerList').innerHTML=arr.length?arr.map(c=>`<div class="manager-row"><div><b>${esc(c.name)}</b><div class="muted">${esc([c.address1,c.address2,c.city].filter(Boolean).join(', '))}</div><div class="muted">${esc(c.gstin||'No GSTIN')}</div></div><button class="secondary editCustomer" data-id="${esc(c.id)}">Edit</button></div>`).join(''):'<div class="info empty">No customers found.</div>';document.querySelectorAll('.editCustomer').forEach(b=>b.onclick=()=>openCustomerModal(b.dataset.id))}
function openCustomerModal(id=null){editingCustomerId=id;let c=id?C.find(x=>String(x.id)===String(id)):{};$('customerModalTitle').textContent=id?'Edit customer':'Add customer';$('mcName').value=c?.name||'';$('mcAddress1').value=c?.address1||'';$('mcAddress2').value=c?.address2||'';$('mcCity').value=c?.city||'';$('mcState').value=c?.state||'Maharashtra';$('mcPincode').value=c?.pincode||'';$('mcGstin').value=c?.gstin||'';$('mcPhone').value=c?.phone||'';$('mcEmail').value=c?.email||'';$('deleteCustomerBtn').hidden=!id;$('customerModal').hidden=false}
function closeCustomerModal(){$('customerModal').hidden=true;editingCustomerId=null}
async function saveCustomer(){let name=cleanText($('mcName').value);if(!name){alert('Enter the customer name.');return}let duplicate=C.find(c=>c.name.toLowerCase()===name.toLowerCase()&&String(c.id)!==String(editingCustomerId));if(duplicate&&!confirm('A customer with this name already exists. Save another one anyway?'))return;let c={id:editingCustomerId||null,name,address1:cleanText($('mcAddress1').value),address2:cleanText($('mcAddress2').value),city:cleanText($('mcCity').value),state:cleanText($('mcState').value),pincode:cleanText($('mcPincode').value),gstin:cleanText($('mcGstin').value).toUpperCase(),phone:cleanText($('mcPhone').value),email:cleanText($('mcEmail').value)};try{let saved=await window.EasyDB.saveCustomer(c);let idx=C.findIndex(x=>String(x.id)===String(saved.id));if(idx>=0)C[idx]=saved;else C.push(saved);saveMasters();closeCustomerModal();renderCustomerManager()}catch(err){alert('Could not save customer: '+err.message)}}
async function deleteCustomer(){let c=C.find(x=>String(x.id)===String(editingCustomerId));if(!c)return;if(!confirm(`Delete ${c.name}? Existing saved invoices will keep their customer copy.`))return;try{await window.EasyDB.deleteCustomer(c.id);C=C.filter(x=>String(x.id)!==String(c.id));saveMasters();closeCustomerModal();renderCustomerManager()}catch(err){alert('Could not delete customer: '+err.message)}}
function renderItemManager(){let q=cleanText($('itemManagerSearch').value).toLowerCase();let arr=I.filter(i=>[i.description,i.code,i.hsn].join(' ').toLowerCase().includes(q)).sort((a,b)=>a.description.localeCompare(b.description));$('itemManagerList').innerHTML=arr.length?arr.map(i=>`<div class="manager-row"><div><b>${esc(i.description)}</b><div class="muted">Code: ${esc(i.code||'—')} · HSN: ${esc(i.hsn||'—')} · GST: ${Number(i.gst_rate||0)}%</div></div><button class="secondary editItem" data-id="${esc(i.id)}">Edit</button></div>`).join(''):'<div class="info empty">No materials found.</div>';document.querySelectorAll('.editItem').forEach(b=>b.onclick=()=>openItemModal(b.dataset.id))}
function openItemModal(id=null){editingItemId=id;let i=id?I.find(x=>String(x.id)===String(id)):{};$('itemModalTitle').textContent=id?'Edit material':'Add material';$('miCode').value=i?.code||'';$('miHsn').value=i?.hsn||'';$('miDescription').value=i?.description||'';$('miGst').value=i?.gst_rate??18;$('miRate').value=i?.default_rate??0;$('deleteItemBtn').hidden=!id;$('itemModal').hidden=false}
function closeItemModal(){$('itemModal').hidden=true;editingItemId=null}
async function saveItem(){let description=cleanText($('miDescription').value);if(!description){alert('Enter the material description.');return}let i={id:editingItemId||null,code:cleanText($('miCode').value),description,hsn:cleanText($('miHsn').value),gst_rate:Number($('miGst').value||0),default_rate:Number($('miRate').value||0)};try{let saved=await window.EasyDB.saveMaterial(i);let idx=I.findIndex(x=>String(x.id)===String(saved.id));if(idx>=0)I[idx]=saved;else I.push(saved);saveMasters();closeItemModal();renderItemManager()}catch(err){alert('Could not save material: '+err.message)}}
async function deleteItem(){let i=I.find(x=>String(x.id)===String(editingItemId));if(!i)return;if(!confirm(`Delete ${i.description}? Existing saved invoices will keep their material copy.`))return;try{await window.EasyDB.deleteMaterial(i.id);I=I.filter(x=>String(x.id)!==String(i.id));saveMasters();closeItemModal();renderItemManager()}catch(err){alert('Could not delete material: '+err.message)}}
function backupPayload(){return{app:'EasyInvoice',version:2,exportedAt:new Date().toISOString(),customers:C,items:I,invoices:invoices()}}
function renderBackupSummary(){$('backupSummary').innerHTML=`<b>${C.length}</b> customers · <b>${I.length}</b> materials · <b>${invoices().length}</b> saved invoices<br><span class="muted">Primary data is stored as individual rows in Supabase. JSON download remains available as an additional backup.</span>`;renderCloudStatus()}
function exportBackup(){let blob=new Blob([JSON.stringify(backupPayload(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`EasyInvoice-backup-${isoToday()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function restoreBackup(){let file=$('restoreFile').files[0];if(!file){alert('Choose a backup file first.');return}try{let d=JSON.parse(await file.text());if(!Array.isArray(d.customers)||!Array.isArray(d.items)||!Array.isArray(d.invoices))throw new Error('Invalid backup structure');if(!confirm(`Import ${d.customers.length} customers, ${d.items.length} materials and ${d.invoices.length} invoices into empty direct tables?`))return;let result=await window.EasyDB.importLegacy(d.customers,d.items,d.invoices);if(result.skipped)throw new Error(result.reason);await bootstrap();alert('Backup imported successfully.')}catch(e){alert('Could not import this file: '+e.message)}}

$('invoiceBtn').onclick=()=>showView('editorView');
$('customersBtn').onclick=()=>showView('customersView');
$('itemsBtn').onclick=()=>showView('itemsView');
$('backupBtn').onclick=()=>showView('backupView');
$('addCustomerBtn').onclick=()=>openCustomerModal();
$('closeCustomerModal').onclick=closeCustomerModal;
$('saveCustomerBtn').onclick=saveCustomer;
$('deleteCustomerBtn').onclick=deleteCustomer;
$('customerManagerSearch').oninput=renderCustomerManager;
$('addItemBtn').onclick=()=>openItemModal();
$('closeItemModal').onclick=closeItemModal;
$('saveItemBtn').onclick=saveItem;
$('deleteItemBtn').onclick=deleteItem;
$('itemManagerSearch').oninput=renderItemManager;
$('exportBackupBtn').onclick=exportBackup;
$('restoreBackupBtn').onclick=restoreBackup;




function renderCloudStatus(message='') {
  const ok=Boolean(window.EasyDB?.configured());
  $('cloudBadge').textContent=ok?'Direct database':'Setup required';
  $('cloudBadge').className='cloud-badge '+(ok?'online':'error');
  $('cloudStatus').innerHTML=message||(ok?'Customers, materials and invoices are stored as individual Supabase rows.':'Run supabase-direct-tables-setup.sql and check config.js.');
  $('pushCloudBtn').hidden=true;
  $('pullCloudBtn').hidden=true;
}
async function bootstrap(){
  try{
    if(!window.EasyDB?.configured())throw new Error('Supabase is not configured.');
    renderCloudStatus('Loading direct-table data from Supabase…');
    C=await window.EasyDB.listCustomers();
    I=await window.EasyDB.listMaterials();
    INV=await window.EasyDB.listInvoices();
    if(!C.length&&!I.length){
      const legacyCustomers=JSON.parse(localStorage.getItem('easyCustomers')||'null')||SEED_C;
      const legacyItems=JSON.parse(localStorage.getItem('easyItems')||'null')||SEED_I;
      const legacyInvoices=JSON.parse(localStorage.getItem('easyInvoices')||'[]');
      if(legacyCustomers.length||legacyItems.length||legacyInvoices.length){
        renderCloudStatus('Importing existing browser data into individual Supabase rows…');
        await window.EasyDB.importLegacy(legacyCustomers,legacyItems,legacyInvoices);
        C=await window.EasyDB.listCustomers(); I=await window.EasyDB.listMaterials(); INV=await window.EasyDB.listInvoices();
      }
    }
    populate();reset();renderBackupSummary();renderCloudStatus(`Connected: ${C.length} customers, ${I.length} materials and ${INV.length} invoices.`);
  }catch(err){
    renderCloudStatus('Database setup error: '+esc(err.message));
    alert('EasyInvoice could not load Supabase direct tables: '+err.message);
  }
}
window.addEventListener('load',bootstrap);
