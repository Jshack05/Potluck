/*
 * Provider boundary for the front-end prototype.
 *
 * The mock implementation is deliberately synchronous so index.html still works
 * when opened directly from disk. A production backend can implement this same
 * contract with Highnote. Browser code must never receive PAN, CVV, or expiry.
 */
(function attachPotluckProviders(global) {
  const clone = value => JSON.parse(JSON.stringify(value));
  const round = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  const id = prefix => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

  class PaymentProviderAdapter {
    createHostAccountHolder() { throw new Error('Not implemented'); }
    getHostOnboardingStatus() { throw new Error('Not implemented'); }
    createSubscriptionCard() { throw new Error('Not implemented'); }
    getCardBalance() { throw new Error('Not implemented'); }
    getCardDisplayToken() { throw new Error('Not implemented'); }
    addHostFunds() { throw new Error('Not implemented'); }
    freezeCard() { throw new Error('Not implemented'); }
    closeCard() { throw new Error('Not implemented'); }
    configureSpendControls() { throw new Error('Not implemented'); }
    receiveAuthorizationWebhook() { throw new Error('Server-only'); }
    receiveTransactionWebhook() { throw new Error('Server-only'); }
  }

  class MockPaymentProvider extends PaymentProviderAdapter {
    createHostAccountHolder(host) {
      return { ...host, highnoteAccountHolderId: null, highnoteApplicationId: null, onboardingStatus: 'mock_approved' };
    }
    getHostOnboardingStatus(host) { return host?.onboardingStatus || 'not_started'; }
    createSubscriptionCard(input) {
      return {
        provider: 'mock',
        highnoteCardProductId: null,
        highnoteFinancialAccountId: null,
        highnotePaymentCardId: null,
        cardStatus: 'active',
        cardLast4: String(Math.floor(1000 + Math.random() * 9000)),
        balanceSource: 'mock',
        mockBalance: round(input.openingBalance || 0),
        spendControlConfig: clone(input.spendControlConfig || {})
      };
    }
    getCardBalance(card) { return round(card?.mockBalance || 0); }
    getCardDisplayToken() {
      return { mode: 'mock_placeholder', token: null, message: 'Secure card viewer unavailable in prototype' };
    }
    addHostFunds(card, input) {
      card.mockBalance = round(this.getCardBalance(card) + Number(input.amount || 0));
      return { providerEventId: id('mock_funding'), balance: card.mockBalance, status: 'mocked' };
    }
    freezeCard(card) { card.cardStatus = 'frozen'; return { status: card.cardStatus }; }
    closeCard(card) { card.cardStatus = 'closed'; return { status: card.cardStatus }; }
    configureSpendControls(card, config) { card.spendControlConfig = clone(config); return clone(config); }
    receiveAuthorizationWebhook(event) { return clone(event); }
    receiveTransactionWebhook(event) { return clone(event); }
  }

  // Documentation-only placeholder. Real calls belong on the Potluck backend,
  // authenticated with server-held credentials and verified webhook signatures.
  class HighnotePaymentProvider extends PaymentProviderAdapter {
    unavailable() { throw new Error('Highnote integration is not enabled in this prototype'); }
    createHostAccountHolder() { return this.unavailable(); }
    getHostOnboardingStatus() { return this.unavailable(); }
    createSubscriptionCard() { return this.unavailable(); }
    getCardBalance() { return this.unavailable(); }
    getCardDisplayToken() { return this.unavailable(); }
    addHostFunds() { return this.unavailable(); }
    freezeCard() { return this.unavailable(); }
    closeCard() { return this.unavailable(); }
    configureSpendControls() { return this.unavailable(); }
  }

  global.PotluckProviders = {
    PaymentProviderAdapter,
    MockPaymentProvider,
    HighnotePaymentProvider,
    providers: { mock: new MockPaymentProvider(), highnote: new HighnotePaymentProvider() },
    forCard(card) { return this.providers[card?.provider] || this.providers.mock; }
  };
})(window);
