// Get data from previous nodes
const mistralResponse = $('HTTP Request').item.json;
const processVars = $('Initialize Process Variables').item.json;
const vendorProfile = $('Find Vendor Profile').item.json;
const extractedData = JSON.parse(mistralResponse.document_annotation);

// Helper functions
function roundToTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function normalizeDate(dateStr) {
  if (!dateStr) return null;
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
	return dateStr;
  }
  
  const patterns = [
	/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
	/(\d{1,2})\/(\d{1,2})\/(\d{2})/,
	/(\d{1,2})-(\d{1,2})-(\d{4})/
  ];
  
  for (const pattern of patterns) {
	const match = dateStr.match(pattern);
	if (match) {
	  if (match[0].includes('/')) {
		if (match[3].length === 4) {
		  const month = match[1].padStart(2, '0');
		  const day = match[2].padStart(2, '0');
		  const year = match[3];
		  return `${year}-${month}-${day}`;
		} else if (match[3].length === 2) {
		  const month = match[1].padStart(2, '0');
		  const day = match[2].padStart(2, '0');
		  const yearPart = parseInt(match[3]);
		  const year = yearPart <= 50 ? `20${match[3]}` : `19${match[3]}`;
		  return `${year}-${month}-${day}`;
		}
	  }
	}
  }
  return dateStr;
}

// Process line items using vendor rules
function processLineItem(item, index) {
  let amount = parseFloat(item.extended_value) || 
			   parseFloat(item.amount) || 0;
  let quantity = parseFloat(item.quantity_shipped) || 
				 parseFloat(item.quantity) || 0;
  
  const desc = (item.description || '').toLowerCase();
  const partNum = (item.part_number || '').toLowerCase();
  
// Check if it's a restock fee using vendor patterns
let isRestockFee = false;

// For Big Lift, be very specific about the pattern
if (vendorProfile.vendor_name === 'Big Lift LLC') {
  isRestockFee = desc.includes('% restock fee for') || 
				 (desc.includes('25.0000% restock fee') && !desc.includes('customer return'));
} else {
  // For other vendors, use their patterns
  isRestockFee = (vendorProfile.restock_fee_patterns || []).some(
	pattern => {
	  const p = pattern.toLowerCase();
	  return desc.includes(p) || partNum.includes(p);
	}
  ) || (desc.includes('% restocking fee') || desc.includes('restocking fee for'));
}
  
  // Check if it's a core charge using vendor patterns
  const isCoreCharge = (vendorProfile.core_charge_patterns || []).some(
	pattern => {
	  const p = pattern.toLowerCase();
	  return desc.includes(p) || partNum.includes(p);
	}
  ) || (desc.includes('core') && (desc.includes('charge') || desc.includes('**')));
  
  // Apply sign rules based on vendor profile
  const signRule = vendorProfile.line_items_sign_rule || 'follow_total';
  
  switch (signRule) {
	case 'always_negative':
	  if (!isRestockFee && amount > 0) amount = -amount;
	  if (!isRestockFee && quantity > 0) quantity = -quantity;
	  break;
	  
	case 'always_positive':
	  amount = Math.abs(amount);
	  quantity = Math.abs(quantity);
	  break;
	  
	case 'trust_ocr':
	  // Keep as OCR extracted
	  break;
	  
	case 'conditional':
	  if (isRestockFee) {
		amount = Math.abs(amount);
		quantity = Math.abs(quantity);
	  } else {
		if (amount > 0) amount = -amount;
		if (quantity > 0) quantity = -quantity;
	  }
	  break;
	  
	default:
	  // For unknown vendors, follow sign convention
	  if (vendorProfile.sign_convention === 'positive_is_credit') {
		if (!isRestockFee && amount > 0) amount = -amount;
	  } else if (vendorProfile.sign_convention === 'negative_is_credit') {
		if (!isRestockFee && amount < 0) amount = amount;
	  }
  }
  
  return {
	lineNumber: item.line_number || (index + 1).toString(),
	partNumber: (item.part_number || '').trim().toUpperCase(),
	description: (item.description || '').trim(),
	quantity: quantity,
	unitPrice: roundToTwo(Math.abs(
	  parseFloat(item.unit_value) || 
	  parseFloat(item.dnp) || 
	  parseFloat(item.unit_price) || 0
	)),
	amount: roundToTwo(amount),
	isRestockFee: isRestockFee,
	isCoreCharge: isCoreCharge
  };
}

// Process all line items
const lineItems = (extractedData.line_items || []).map((item, idx) => 
  processLineItem(item, idx)
);

// Detect what fees are in line items vs subtotals
const hasRestockInLines = lineItems.some(item => item.isRestockFee);
const hasCoreInLines = lineItems.some(item => item.isCoreCharge);

// Calculate fees based on vendor profile
const fees = {
  restockFee: 0,
  salesTax: parseFloat(extractedData.subtotals?.total_sales_tax) || 0,
  miscCharges: parseFloat(extractedData.subtotals?.misc_charges) || 0,
  cores: 0,
  dealerServiceFee: parseFloat(extractedData.subtotals?.dealer_service_fee) || 0,
  emergencySurcharges: parseFloat(extractedData.subtotals?.emergency_surcharges) || 0,
  freightHandling: parseFloat(extractedData.subtotals?.freight_handling) || 0,
  claimAmount: parseFloat(extractedData.subtotals?.claim_amount) || 0
};

// Only add fees from subtotals if not already in line items
if (vendorProfile.restock_fee_location === 'subtotal' && !hasRestockInLines) {
  const rawRestock = parseFloat(extractedData.subtotals?.restock_fee) || 0;
  fees.restockFee = Math.abs(rawRestock);
}

if (vendorProfile.core_charge_location === 'subtotal' && !hasCoreInLines) {
  fees.cores = Math.abs(parseFloat(extractedData.subtotals?.cores) || 0);
}

// Calculate totals
const lineSum = roundToTwo(lineItems.reduce((sum, line) => sum + line.amount, 0));
let calculatedTotal = lineSum;

// Apply fee rules based on vendor profile
if (fees.restockFee > 0 && vendorProfile.restock_fee_location !== 'built_in_net') {
  calculatedTotal = roundToTwo(calculatedTotal + fees.restockFee);
}

if (vendorProfile.sales_tax_increases_credit && fees.salesTax > 0) {
  calculatedTotal = roundToTwo(calculatedTotal - fees.salesTax);
}

if (vendorProfile.misc_charges_reduce_credit && fees.miscCharges > 0) {
  calculatedTotal = roundToTwo(calculatedTotal + fees.miscCharges);
}

if (!hasCoreInLines && fees.cores > 0) {
  calculatedTotal = roundToTwo(calculatedTotal + fees.cores);
}

// Add other fees (but not claim_amount - that's the total, not a fee)
calculatedTotal = roundToTwo(
  calculatedTotal + 
  fees.dealerServiceFee +
  fees.emergencySurcharges +
  fees.freightHandling
);

// Get actual total and apply vendor-specific total sign rules
let actualTotal = parseFloat(extractedData.total_amount) || 0;

// Apply total amount sign rule based on vendor profile
const totalSignRule = vendorProfile.total_amount_sign_rule || 'follow_convention';

if (totalSignRule === 'always_negative' && actualTotal > 0) {
  // Vendor shows positive amounts that should be negative for credits
  actualTotal = -actualTotal;
} else if (totalSignRule === 'always_positive' && actualTotal < 0) {
  // Vendor shows negative amounts that should be positive
  actualTotal = Math.abs(actualTotal);
} else if (totalSignRule === 'follow_convention') {
  // Apply based on general sign convention
  if (vendorProfile.sign_convention === 'positive_is_credit' && actualTotal > 0) {
	actualTotal = -actualTotal;
  }
}

const discrepancy = Math.abs(calculatedTotal - actualTotal);
const isValid = discrepancy < 0.01;

// Calculate quality score - PRIORITIZING ACCURACY
let qualityScore = 0;
let qualityDetails = {};

// Total validation (45 points - HIGHEST WEIGHT)
if (discrepancy < 0.01) {
  qualityScore += 45;
  qualityDetails.totalMatches = true;
} else if (discrepancy < 1) {
  qualityScore += 35;
  qualityDetails.totalClose = true;
} else if (discrepancy < 10) {
  qualityScore += 20;
  qualityDetails.totalWithin10 = true;
} else {
  qualityScore += 5;
  qualityDetails.totalOff = roundToTwo(discrepancy);
}

// Line items (25 points - SECOND PRIORITY)
if (lineItems.length > 0) {
  qualityScore += Math.min(25, 5 + (lineItems.length * 2));
  // Base 5 points for having any items, +2 per item up to 25
  qualityDetails.lineItemCount = lineItems.length;
}

// Document number (15 points)
if (extractedData.vendor_doc_number) {
  qualityScore += 15;
  qualityDetails.hasDocNumber = true;
}

// Vendor match (10 points - REDUCED WEIGHT)
if (vendorProfile.match_score >= 95) {
  qualityScore += 10;
  qualityDetails.vendorMatch = 'exact';
} else if (vendorProfile.match_score >= 70) {
  qualityScore += 7;
  qualityDetails.vendorMatch = 'fuzzy';
} else {
  qualityScore += 2;
  qualityDetails.vendorMatch = 'unknown';
}

// References (5 points)
const poCount = (extractedData.po_numbers || []).length;
const vraCount = (extractedData.vra_numbers || []).length;
const refScore = Math.min(5, poCount * 2 + vraCount * 2);
qualityScore += refScore;
if (refScore > 0) {
  qualityDetails.hasReferences = true;
}

// Parse PO/Order numbers
function extractPONumbers(poArray) {
  if (!Array.isArray(poArray)) return { poNumbers: [], orderNumbers: [] };
  
  const poNumbers = [];
  const orderNumbers = [];
  
  [...new Set(poArray)].forEach(po => {
	if (!po) return;
	const poStr = po.toString().trim();
	
	if (/^\d{10}$/.test(poStr)) {
	  orderNumbers.push(poStr);
	} else {
	  poNumbers.push(poStr);
	}
  });
  
  return { poNumbers, orderNumbers };
}

const { poNumbers, orderNumbers } = extractPONumbers(extractedData.po_numbers);

// Build warnings array
const warnings = [];
if (!extractedData.vendor_doc_number) {
  warnings.push("Missing document number");
}
if (!isValid) {
  warnings.push(`Total mismatch: Calculated ${calculatedTotal} vs Actual ${actualTotal} (${roundToTwo(discrepancy)} difference)`);
}
if (hasRestockInLines) {
  const restockTotal = lineItems
	.filter(item => item.isRestockFee)
	.reduce((sum, item) => sum + item.amount, 0);
  warnings.push(`Restock fees in line items: ${roundToTwo(restockTotal)}`);
}
if (fees.restockFee > 0) {
  warnings.push(`Restock fee in subtotal: ${fees.restockFee}`);
}

// Build normalized output
const normalized = {
  processId: processVars.processId,
  timestamp: processVars.timestamp,
  status: "normalized",
  
  vendor: {
	name: vendorProfile.vendor_name,
	documentNumber: extractedData.vendor_doc_number?.trim() || "",
	profileId: vendorProfile.id,
	matchScore: vendorProfile.match_score,
	confidence: vendorProfile.confidence_level
  },
  
  customer: {
	name: extractedData.customer_name?.trim() || ""
  },
  
  document: {
	type: "VENDOR_CREDIT",
	date: normalizeDate(extractedData.credit_date),
	currency: extractedData.currency || "USD",
	totalAmount: actualTotal,
	fees: fees,
	subtotalParts: fees.totalParts || lineSum
  },
  
  references: {
	vraNumbers: [...new Set((extractedData.vra_numbers || []).filter(v => v))],
	poNumbers: poNumbers,
	orderNumbers: orderNumbers,
	invoiceNumbers: [...new Set((extractedData.invoice_numbers || []).filter(i => i))]
  },
  
  lineItems: lineItems,
  
  validation: {
	qualityScore: qualityScore,
	qualityDetails: qualityDetails,
	hasRequiredFields: !!vendorProfile.vendor_name && !!extractedData.vendor_doc_number && actualTotal !== 0,
	hasVendor: !!vendorProfile.vendor_name,
	hasDocNumber: !!extractedData.vendor_doc_number,
	hasAmount: actualTotal !== 0,
	hasLineItems: lineItems.length > 0,
	lineSum: lineSum,
	lineSumMatchesTotal: isValid,
	calculatedTotal: calculatedTotal,
	actualTotal: actualTotal,
	discrepancy: discrepancy,
	breakdown: {
	  lineItemsTotal: lineSum,
	  hasRestockFeeLineItems: hasRestockInLines,
	  hasCoreChargeLineItems: hasCoreInLines,
	  restockFee: fees.restockFee,
	  salesTax: fees.salesTax,
	  cores: fees.cores,
	  miscCharges: fees.miscCharges,
	  calculatedTotal: calculatedTotal,
	  actualTotal: actualTotal,
	  discrepancy: discrepancy
	}
  },
  
  warnings: warnings,
  
  readyForMatching: (qualityScore >= 80),
  
 learningData: {
  needsLearning: qualityScore < 70,      // Was < 80
  needsReview: qualityScore >= 70 && qualityScore < 85,  // Was 80-99
  autoApproved: qualityScore >= 85,      // Was >= 99
  vendorProfileUsed: vendorProfile.id || null  // KEEP THIS
},
  
  summary: {
	vendor: vendorProfile.vendor_name,
	documentNumber: extractedData.vendor_doc_number,
	total: actualTotal,
	lineCount: lineItems.length,
	lineItemsTotal: lineSum,
	poNumbers: poNumbers.join(', '),
	vraNumbers: (extractedData.vra_numbers || []).join(', ') || 'None',
	validated: isValid,
	qualityScore: qualityScore
  },
  
  rawExtraction: extractedData
};

return normalized;