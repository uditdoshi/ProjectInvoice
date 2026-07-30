(function () {
  const cfg = window.EASYINVOICE_CONFIG?.cloud || {};
  let client = null;

  function configured() {
    return Boolean(
      cfg.enabled && cfg.supabaseUrl && cfg.supabasePublishableKey && cfg.workspaceId &&
      !String(cfg.supabaseUrl).startsWith('PASTE_') &&
      !String(cfg.supabasePublishableKey).startsWith('PASTE_') &&
      !String(cfg.workspaceId).startsWith('PASTE_') && window.supabase
    );
  }

  function db() {
    if (!configured()) throw new Error('Supabase is not configured in config.js.');
    if (!client) client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
    return client;
  }

  const ws = () => cfg.workspaceId;
  const fail = (error) => { if (error) throw error; };

  function customerFromRow(r) {
    return {
      id: String(r.id), name: r.name || '', address1: r.address1 || '', address2: r.address2 || '',
      city: r.city || '', state: r.state || '', pincode: r.pincode || '', gstin: r.gstin || '',
      phone: r.phone || '', email: r.email || '', cst_tin: r.cst_tin || '', vat_tin: r.vat_tin || ''
    };
  }
  function customerToRow(c) {
    return {
      workspace_id: ws(), name: c.name, address1: c.address1 || '', address2: c.address2 || '',
      city: c.city || '', state: c.state || '', pincode: c.pincode || '', gstin: c.gstin || '',
      phone: c.phone || '', email: c.email || '', cst_tin: c.cst_tin || '', vat_tin: c.vat_tin || ''
    };
  }
  function materialFromRow(r) {
    return { id: String(r.id), code: r.code || '', description: r.description || '', hsn: r.hsn || '', gst_rate: Number(r.gst_rate || 0), default_rate: Number(r.default_rate || 0) };
  }
  function materialToRow(i) {
    return { workspace_id: ws(), code: i.code || '', description: i.description, hsn: i.hsn || '', gst_rate: Number(i.gst_rate || 0), default_rate: Number(i.default_rate || 0) };
  }

  async function listCustomers() {
    const { data, error } = await db().from('ei_customers').select('*').eq('workspace_id', ws()).order('name'); fail(error);
    return (data || []).map(customerFromRow);
  }
  async function saveCustomer(c) {
    if (c.id) {
      const { data, error } = await db().from('ei_customers').update(customerToRow(c)).eq('workspace_id', ws()).eq('id', Number(c.id)).select().single(); fail(error);
      return customerFromRow(data);
    }
    const { data, error } = await db().from('ei_customers').insert(customerToRow(c)).select().single(); fail(error);
    return customerFromRow(data);
  }
  async function deleteCustomer(id) {
    const { error } = await db().from('ei_customers').delete().eq('workspace_id', ws()).eq('id', Number(id)); fail(error);
  }

  async function listMaterials() {
    const { data, error } = await db().from('ei_materials').select('*').eq('workspace_id', ws()).order('description'); fail(error);
    return (data || []).map(materialFromRow);
  }
  async function saveMaterial(i) {
    if (i.id) {
      const { data, error } = await db().from('ei_materials').update(materialToRow(i)).eq('workspace_id', ws()).eq('id', Number(i.id)).select().single(); fail(error);
      return materialFromRow(data);
    }
    const { data, error } = await db().from('ei_materials').insert(materialToRow(i)).select().single(); fail(error);
    return materialFromRow(data);
  }
  async function deleteMaterial(id) {
    const { error } = await db().from('ei_materials').delete().eq('workspace_id', ws()).eq('id', Number(id)); fail(error);
  }

  function invoiceFromRow(r) {
    return {
      id: String(r.id), invoiceNo: r.invoice_number, invoiceDate: r.invoice_date, dueDate: r.due_date,
      paymentTerms: r.payment_terms || '', customer: r.customer_snapshot || null, shipping: r.shipping_snapshot || null,
      transporter: r.transporter || '', vehicleNo: r.vehicle_no || '', broker: r.broker || '', lrNo: r.lr_no || '',
      lrDate: r.lr_date || '', otherCharges: Number(r.other_charges || 0), notes: r.notes || '',
      totals: { subtotal: Number(r.subtotal || 0), cgst: Number(r.cgst || 0), sgst: Number(r.sgst || 0), igst: Number(r.igst || 0), other: Number(r.other_charges || 0), total: Number(r.grand_total || 0) },
      createdAt: r.created_at,
      lines: (r.ei_invoice_items || []).sort((a,b)=>a.line_no-b.line_no).map(x => ({
        id: String(x.id), materialId: x.material_id ? String(x.material_id) : null,
        itemName: x.description || '', description: x.description || '', hsn: x.hsn || '', qty: Number(x.quantity || 0),
        rate: Number(x.rate || 0), gst: Number(x.gst_rate || 0), amount: Number(x.amount || 0)
      }))
    };
  }

  async function listInvoices() {
    const { data, error } = await db().from('ei_invoices').select('*,ei_invoice_items(*)').eq('workspace_id', ws()).order('created_at', { ascending: false }); fail(error);
    return (data || []).map(invoiceFromRow);
  }

  async function saveInvoice(inv) {
    const header = {
      workspace_id: ws(), invoice_number: inv.invoiceNo, invoice_date: inv.invoiceDate, due_date: inv.dueDate || null,
      payment_terms: inv.paymentTerms || '', customer_id: inv.customer?.id ? Number(inv.customer.id) : null,
      customer_snapshot: inv.customer || {}, shipping_snapshot: inv.shipping || {}, transporter: inv.transporter || '',
      vehicle_no: inv.vehicleNo || '', broker: inv.broker || '', lr_no: inv.lrNo || '', lr_date: inv.lrDate || null,
      other_charges: Number(inv.otherCharges || 0), notes: inv.notes || '', subtotal: Number(inv.totals.subtotal || 0),
      cgst: Number(inv.totals.cgst || 0), sgst: Number(inv.totals.sgst || 0), igst: Number(inv.totals.igst || 0),
      grand_total: Number(inv.totals.total || 0)
    };
    let row;
    if (inv.id) {
      const res = await db().from('ei_invoices').update(header).eq('workspace_id', ws()).eq('id', Number(inv.id)).select().single(); fail(res.error); row = res.data;
      const del = await db().from('ei_invoice_items').delete().eq('workspace_id', ws()).eq('invoice_id', Number(inv.id)); fail(del.error);
    } else {
      const res = await db().from('ei_invoices').insert(header).select().single(); fail(res.error); row = res.data;
    }
    const itemRows = inv.lines.map((l, idx) => ({
      workspace_id: ws(), invoice_id: row.id, line_no: idx + 1,
      material_id: l.materialId ? Number(l.materialId) : null, description: l.description || l.itemName || '', hsn: l.hsn || '',
      quantity: Number(l.qty || 0), rate: Number(l.rate || 0), gst_rate: Number(l.gst || 0), amount: Number(l.amount || (l.qty*l.rate) || 0)
    }));
    if (itemRows.length) { const ins = await db().from('ei_invoice_items').insert(itemRows); fail(ins.error); }
    const { data, error } = await db().from('ei_invoices').select('*,ei_invoice_items(*)').eq('id', row.id).single(); fail(error);
    return invoiceFromRow(data);
  }

  async function importLegacy(customers, materials, invoices) {
    const existing = await listCustomers();
    if (existing.length) return { skipped: true, reason: 'Customers already exist in the new tables.' };
    const customerMap = new Map();
    for (const c of customers || []) {
      const saved = await saveCustomer({ ...c, id: null });
      customerMap.set(String(c.id), saved);
    }
    const materialMap = new Map();
    for (const i of materials || []) {
      const saved = await saveMaterial({ ...i, id: null });
      materialMap.set(String(i.id), saved);
    }
    for (const inv of invoices || []) {
      const customer = customerMap.get(String(inv.customer?.id)) || inv.customer;
      const shipping = customerMap.get(String(inv.shipping?.id)) || inv.shipping;
      const migrated = { ...inv, id: null, customer, shipping, lines: (inv.lines || []).map(l => ({ ...l, materialId: null })) };
      await saveInvoice(migrated);
    }
    return { skipped: false, customers: customers?.length || 0, materials: materials?.length || 0, invoices: invoices?.length || 0 };
  }

  window.EasyDB = { configured, listCustomers, saveCustomer, deleteCustomer, listMaterials, saveMaterial, deleteMaterial, listInvoices, saveInvoice, importLegacy };
})();
