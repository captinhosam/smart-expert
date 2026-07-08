import { CaseData, CalculationResults } from '../types';

/**
 * Computes all the structural, financial, tax, and inheritance values
 * based on the provided CaseData.
 */
export function calculateAll(caseData: CaseData): CalculationResults {
  const {
    landArea,
    landType,
    hasBuilding,
    buildingArea,
    floors,
    finishType,
    buildingAge,
    annualRent,
    estateValue,
    heirs
  } = caseData;

  // 1. Convert land area to traditional Egyptian units (Faddan, Qirat, Sahm)
  // 1 Faddan = 4200 sqm
  // 1 Qirat = 175 sqm (4200 / 24)
  // 1 Sahm = 7.29 sqm (175 / 24)
  const remainingSqm = landArea;
  const faddan = Math.floor(remainingSqm / 4200);
  const remainingForQirat = remainingSqm % 4200;
  const qirat = Math.floor(remainingForQirat / 175);
  const remainingForSahm = remainingForQirat % 175;
  const sahm = Number((remainingForSahm / 7.29).toFixed(2));

  // 2. Land valuation calculation
  let landValue = 0;
  if (landType === 'زراعية') {
    // 500,000 EGP per Faddan
    const landInFaddan = landArea / 4200;
    landValue = landInFaddan * 500000;
  } else if (landType === 'صحراوية') {
    // 150,000 EGP per Faddan
    const landInFaddan = landArea / 4200;
    landValue = landInFaddan * 150000;
  } else if (landType === 'بناء') {
    // 15,000 EGP per sqm
    landValue = landArea * 15000;
  } else if (landType === 'صناعية') {
    // 2,000 EGP per sqm
    landValue = landArea * 2000;
  } else if (landType === 'تجارية') {
    // 5,000 EGP per sqm
    landValue = landArea * 5000;
  }

  // 3. Construction materials & cost calculation
  let concreteVolume = 0;
  let steelWeight = 0;
  let bricksCount = 0;
  let cementTons = 0;
  let constructionCost = 0;
  let depreciatedBuildingValue = 0;

  if (hasBuilding && floors > 0) {
    const totalBuiltArea = buildingArea * floors;

    // Concrete volume = area * slab thickness (estimated 22cm) * floors
    concreteVolume = buildingArea * 0.22 * floors;

    // Steel weight = concrete volume * 100 kg/m3 (converted to tons)
    steelWeight = (concreteVolume * 100) / 1000;

    // Cement tons = concrete volume * 350 kg/m3 (converted to tons)
    cementTons = (concreteVolume * 350) / 1000;

    // Bricks count = total built area * 60 bricks per sqm (rough estimate)
    bricksCount = totalBuiltArea * 60;

    // Finish cost per sqm
    let finishCostPerM2 = 500;
    switch (finishType) {
      case 'قديم':
        finishCostPerM2 = 300;
        break;
      case 'نصف تشطيب':
        finishCostPerM2 = 500;
        break;
      case 'لوكس':
        finishCostPerM2 = 800;
        break;
      case 'سوبر لوكس':
        finishCostPerM2 = 1500;
        break;
      case 'الترا سوبر لوكس':
        finishCostPerM2 = 2500;
        break;
    }

    // Cost of structure = Concrete volume * 4,500 EGP/m3 (standard raw materials cost including labor)
    const structuralCost = concreteVolume * 4500;
    const finishingCost = totalBuiltArea * finishCostPerM2;
    constructionCost = structuralCost + finishingCost;

    // Depreciation (Lifespan 50 years, minimum value 15%)
    const depreciationFactor = Math.min(0.85, (buildingAge / 50));
    depreciatedBuildingValue = constructionCost * (1 - depreciationFactor);
  }

  // 4. Total property value
  const totalPropertyValue = landValue + depreciatedBuildingValue;

  // 5. Financial metrics
  // Exempt 50,000 EGP from rental income for taxes
  const taxBase = Math.max(0, annualRent - 50000);
  const propertyTax = taxBase * 0.10; // 10%
  const transferTax = totalPropertyValue * 0.025; // 2.5% transaction tax
  const registrationFee = Math.min(5000, totalPropertyValue * 0.005); // 0.5% capped at 5k EGP
  const notaryFee = totalPropertyValue * 0.0025; // 0.25%

  const netAnnualIncome = annualRent - propertyTax - (annualRent * 0.05); // Subtract rent tax and 5% maintenance cost
  const roi = totalPropertyValue > 0 ? (annualRent / totalPropertyValue) * 100 : 0;
  const grm = annualRent > 0 ? totalPropertyValue / annualRent : 0;
  const capRate = totalPropertyValue > 0 ? (netAnnualIncome / totalPropertyValue) * 100 : 0;

  // 6. Islamic Inheritance Law (للذكر مثل حظ الأنثيين)
  // Let's model a robust Egyptian/Islamic inheritance resolver:
  // First, check if there is a spouse or parents.
  // Then, residue is divided between sons and daughters (males get twice as females).
  const heirsShares: CalculationResults['heirsShares'] = [];
  const activeHeirs = heirs.filter(h => h.selected !== false);
  if (activeHeirs.length > 0) {
    const calcEstate = estateValue > 0 ? estateValue : 240000;
    let remainingEstate = calcEstate;
    
    // Find spouse
    const wives = activeHeirs.filter(h => h.relationship === 'wife');
    const husbands = activeHeirs.filter(h => h.relationship === 'husband');
    const fathers = activeHeirs.filter(h => h.relationship === 'father');
    const mothers = activeHeirs.filter(h => h.relationship === 'mother');
    const sons = activeHeirs.filter(h => h.relationship === 'son');
    const daughters = activeHeirs.filter(h => h.relationship === 'daughter');
    
    const hasChildren = (sons.length + daughters.length) > 0;
    
    // 1. Wife share (1/8 if children exist, 1/4 if no children)
    if (wives.length > 0) {
      const wifeFactor = hasChildren ? (1/8) : (1/4);
      const totalWifeShare = calcEstate * wifeFactor;
      const individualWifeShare = totalWifeShare / wives.length;
      
      wives.forEach(w => {
        heirsShares.push({
          id: w.id,
          name: w.name,
          gender: 'أنثى',
          shareFraction: hasChildren ? '8/1' : '4/1',
          sharePercent: (wifeFactor / wives.length) * 100,
          shareValue: estateValue > 0 ? individualWifeShare : 0
        });
        remainingEstate -= individualWifeShare;
      });
    }

    // 2. Husband share (1/4 if children exist, 1/2 if no children)
    if (husbands.length > 0) {
      const husbandFactor = hasChildren ? (1/4) : (1/2);
      const husbandShare = calcEstate * husbandFactor;
      
      husbands.forEach(h => {
        heirsShares.push({
          id: h.id,
          name: h.name,
          gender: 'ذكر',
          shareFraction: hasChildren ? '4/1' : '2/1',
          sharePercent: husbandFactor * 100,
          shareValue: estateValue > 0 ? husbandShare : 0
        });
        remainingEstate -= husbandShare;
      });
    }

    // 3. Father share (1/6 if children exist)
    if (fathers.length > 0) {
      const fatherFactor = 1/6;
      const fatherShare = calcEstate * fatherFactor;
      fathers.forEach(f => {
        heirsShares.push({
          id: f.id,
          name: f.name,
          gender: 'ذكر',
          shareFraction: '6/1',
          sharePercent: fatherFactor * 100,
          shareValue: estateValue > 0 ? fatherShare : 0
        });
        remainingEstate -= fatherShare;
      });
    }

    // 4. Mother share (1/6 if children exist)
    if (mothers.length > 0) {
      const motherFactor = 1/6;
      const motherShare = calcEstate * motherFactor;
      mothers.forEach(m => {
        heirsShares.push({
          id: m.id,
          name: m.name,
          gender: 'أنثى',
          shareFraction: '6/1',
          sharePercent: motherFactor * 100,
          shareValue: estateValue > 0 ? motherShare : 0
        });
        remainingEstate -= motherShare;
      });
    }

    // 5. Children share (Residue divided: 2 parts for male, 1 part for female)
    const sonsCount = sons.length;
    const daughtersCount = daughters.length;
    const totalChildrenShares = (sonsCount * 2) + daughtersCount;

    if (totalChildrenShares > 0 && remainingEstate > 0) {
      const singleChildShare = remainingEstate / totalChildrenShares;
      
      sons.forEach(s => {
        heirsShares.push({
          id: s.id,
          name: s.name,
          gender: 'ذكر',
          shareFraction: `عصبة (للذكر مثل حظ الأنثيين)`,
          sharePercent: ((singleChildShare * 2) / calcEstate) * 100,
          shareValue: estateValue > 0 ? singleChildShare * 2 : 0
        });
      });

      daughters.forEach(d => {
        heirsShares.push({
          id: d.id,
          name: d.name,
          gender: 'أنثى',
          shareFraction: `عصبة (للذكر مثل حظ الأنثيين)`,
          sharePercent: (singleChildShare / calcEstate) * 100,
          shareValue: estateValue > 0 ? singleChildShare : 0
        });
      });
    }
  }

  return {
    faddan,
    qirat,
    sahm,
    landValue,
    concreteVolume,
    steelWeight,
    bricksCount,
    cementTons,
    constructionCost,
    depreciatedBuildingValue,
    totalPropertyValue,
    netAnnualIncome,
    roi,
    grm,
    capRate,
    propertyTax,
    transferTax,
    registrationFee,
    notaryFee,
    heirsShares
  };
}
