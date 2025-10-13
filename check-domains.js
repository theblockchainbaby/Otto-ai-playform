#!/usr/bin/env node

/**
 * Domain Availability Checker for Otto AI
 * Run with: node check-domains.js
 */

const https = require('https');
const dns = require('dns');

const domains = [
  'otto.ai',
  'ottoai.com',
  'getotto.ai',
  'tryotto.ai',
  'ottoautomotive.ai',
  'ottodealer.ai',
  'ottoauto.ai',
  'dealerotto.com',
  'ottointelligence.com',
  'ottoplatform.ai',
  'ottosolutions.ai'
];

console.log('🔍 Checking domain availability for Otto AI...\n');

async function checkDomain(domain) {
  return new Promise((resolve) => {
    dns.lookup(domain, (err) => {
      if (err && err.code === 'ENOTFOUND') {
        resolve({ domain, available: true, status: '✅ AVAILABLE' });
      } else {
        resolve({ domain, available: false, status: '❌ Taken' });
      }
    });
  });
}

async function checkAllDomains() {
  console.log('Domain'.padEnd(25) + 'Status'.padEnd(15) + 'Registrar Links');
  console.log('-'.repeat(70));

  for (const domain of domains) {
    const result = await checkDomain(domain);
    const namecheap = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`;
    const porkbun = `https://porkbun.com/checkout/search?q=${domain}`;
    
    console.log(
      result.domain.padEnd(25) + 
      result.status.padEnd(15) + 
      (result.available ? `Namecheap | Porkbun` : 'N/A')
    );
    
    if (result.available) {
      console.log(`  📋 Namecheap: ${namecheap}`);
      console.log(`  📋 Porkbun: ${porkbun}`);
    }
    console.log('');
  }

  const available = domains.filter(async (domain) => {
    const result = await checkDomain(domain);
    return result.available;
  });

  console.log('\n🎯 Recommendations:');
  console.log('1. otto.ai - Perfect brand match, premium .ai extension');
  console.log('2. ottoai.com - Great alternative, widely recognized .com');
  console.log('3. getotto.ai - Modern SaaS style, action-oriented');
  console.log('4. tryotto.ai - Encourages trial, very conversion-friendly');

  console.log('\n💰 Pricing Guide:');
  console.log('• .ai domains: $80-120/year');
  console.log('• .com domains: $10-15/year');
  console.log('• Premium domains: $100-500/year');

  console.log('\n🏆 Best Registrars:');
  console.log('• Namecheap - Great pricing, excellent support');
  console.log('• Porkbun - Developer-friendly, competitive pricing');
  console.log('• GoDaddy - Reliable, widely used');

  console.log('\n🚀 Next Steps:');
  console.log('1. Choose your preferred domain from available options');
  console.log('2. Register with Namecheap or Porkbun');
  console.log('3. Follow DEPLOYMENT.md for hosting setup');
  console.log('4. Configure DNS after deployment');
}

checkAllDomains().catch(console.error);
