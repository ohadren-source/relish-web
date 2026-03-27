"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
require("./App.css");
// ============================================================================
// BACKEND URL (Only this - no API keys in app!)
// ============================================================================
var BACKEND_URL = 'https://sauc-e-backend-production.up.railway.app';
var FREE_WISDOM_LIMIT = 9;
// Payment & external links
var STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/28E00l3HOg638gA6hxa3u00';
var SAUCE_HOME = 'https://sauc-e.com';
var CHECKOUT_URL = 'https://sauc-e.com/checkitout';
var CONTEXTS = ['Life', 'Career', 'Relationships', 'Health', 'Money'];
function App() {
    // ============================================================================
    // STATE
    // ============================================================================
    var isSubscribed = (0, react_1.useState)(false)[0];
    var _a = (0, react_1.useState)(0), wisdomCount = _a[0], setWisdomCount = _a[1];
    var _b = (0, react_1.useState)(''), situation = _b[0], setSituation = _b[1];
    var _c = (0, react_1.useState)('Life'), context = _c[0], setContext = _c[1];
    var _d = (0, react_1.useState)(''), wisdom = _d[0], setWisdom = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var customerId = (0, react_1.useState)(null)[0];
    var freeLeft = Math.max(0, FREE_WISDOM_LIMIT - wisdomCount);
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    (0, react_1.useEffect)(function () {
        syncUsageCount('web-user');
    }, []);
    function syncUsageCount(cid) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_1, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(BACKEND_URL, "/api/relish/usage-status"), {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ customerId: cid || 'anonymous' }),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        setWisdomCount(data.usageCount || 0);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        msg = error_1 instanceof Error ? error_1.message : 'unknown';
                        console.log('Usage sync skipped:', msg);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    // ============================================================================
    // GET WISDOM (Calls backend, NOT Claude directly)
    // ============================================================================
    function handleGetWisdom() {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, data, error_2, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!situation.trim()) {
                            alert('Please describe your situation');
                            return [2 /*return*/];
                        }
                        // If free limit reached, redirect to payment
                        if (!isSubscribed && wisdomCount >= FREE_WISDOM_LIMIT) {
                            window.open(STRIPE_PAYMENT_LINK, '_blank');
                            return [2 /*return*/];
                        }
                        setLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        return [4 /*yield*/, fetch("".concat(BACKEND_URL, "/api/relish/get-wisdom"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    customerId: customerId || 'anonymous',
                                    situation: situation,
                                    context: context,
                                }),
                            })];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        errorData = _a.sent();
                        if (response.status === 403) {
                            window.open(STRIPE_PAYMENT_LINK, '_blank');
                            return [2 /*return*/];
                        }
                        throw new Error(errorData.error || 'Failed to get wisdom');
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _a.sent();
                        setWisdom(data.wisdom);
                        setWisdomCount(function (prev) { return prev + 1; });
                        setSituation('');
                        return [3 /*break*/, 8];
                    case 6:
                        error_2 = _a.sent();
                        msg = error_2 instanceof Error ? error_2.message : 'Failed to process request';
                        alert(msg);
                        return [3 /*break*/, 8];
                    case 7:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    // ============================================================================
    // RENDER
    // ============================================================================
    return (<div className="relish-container">

      {/* ===== HEADER - sauc-e.com branding ===== */}
      <header className="sauce-header">
        <a href={SAUCE_HOME} target="_blank" rel="noopener noreferrer" className="sauce-logo-link">
          <span className="sauce-name">sauc-e</span>
          <span className="sauce-tagline"> where HOME is the </span>
          <span className="sauce-heart">❤️</span>
        </a>
        <nav className="sauce-nav">
          <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="sauce-nav-link">Check It Out Y'all</a>
          <a href={"".concat(SAUCE_HOME, "/about")} target="_blank" rel="noopener noreferrer" className="sauce-nav-link">About</a>
          <a href={"".concat(SAUCE_HOME, "/contact")} target="_blank" rel="noopener noreferrer" className="sauce-nav-link">Contact</a>
        </nav>
      </header>

      {/* ===== RELISH LOGO + TITLE ===== */}
      <div className="relish-header">
        <img src="/icon.png" alt="RELISH" className="relish-logo-image"/>
        <h1 className="relish-title">RELISH</h1>
        <p className="relish-subtitle">Wisdom &amp; Clarity</p>
        <p className="relish-philosophy">Understanding = Quality / Quantity</p>
      </div>

      {/* ===== PREMIUM COUNTER ===== */}
      {!isSubscribed && (<div className="premium-section">
          <a href={STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer" className={"premium-pill".concat(freeLeft === 0 ? ' urgent' : '')}>
            {freeLeft > 0
                ? "Premium \u00B7 ".concat(freeLeft, " free left")
                : 'Upgrade to Premium · $9.99/mo'}
          </a>
        </div>)}

      {/* ===== APP FUNCTIONALITY ===== */}
      <main className="relish-content">
        <h2 className="relish-section-title">Pick a Context</h2>

        {CONTEXTS.map(function (c) { return (<button key={c} className={"relish-context-btn".concat(context === c ? ' active' : '')} onClick={function () { return setContext(c); }}>
            {c}
          </button>); })}

        <h2 className="relish-section-title">Your Situation</h2>
        <textarea className="relish-input" placeholder="Describe what's on your mind..." value={situation} onChange={function (e) { return setSituation(e.target.value); }} rows={4}/>

        <button className={"relish-wisdom-btn".concat(loading ? ' disabled' : '')} onClick={handleGetWisdom} disabled={loading}>
          {loading ? 'Seeking wisdom...' : 'Get Wisdom'}
        </button>

        {wisdom && (<div className="relish-wisdom-box">
            <h3 className="relish-wisdom-title">Wisdom</h3>
            <p className="relish-wisdom-text">{wisdom}</p>
          </div>)}
      </main>

      {/* ===== US vs THEM ===== */}
      <div className="marketing-section">
        <img src="/relish_uvt.png" alt="RELISH Us vs Them" className="uvt-image"/>
      </div>

      {/* ===== PEAK FLAVOUR ===== */}
      <div className="marketing-section">
        <img src="/relish_peak_pacakage.png" alt="Peak Flavour Premium 3,6,9" className="peak-image"/>
      </div>

      {/* ===== SUBSCRIBE CTA ===== */}
      {!isSubscribed && (<div className="cta-section">
          <h2 className="cta-title">Peak Flavour Premium</h2>
          <p className="cta-subtitle">Unlimited wisdom. $9.99/month.</p>
          <p className="cta-hotdog">$9.99 &lt; 3 hot dogs + tax</p>
          <a href={STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer" className="cta-button">
            Subscribe at sauc-e.com
          </a>
        </div>)}

      {/* ===== LEGAL ===== */}
      <div className="legal-section">
        <a href={"".concat(SAUCE_HOME, "/terms")} target="_blank" rel="noopener noreferrer" className="legal-link">Terms of Service</a>
        <span className="legal-separator">  ·  </span>
        <a href="https://docs.google.com/document/d/1AxzEmZn2AjEY7ry6HSM1S6mlB3ggs0SN" target="_blank" rel="noopener noreferrer" className="legal-link">Privacy Policy</a>
        <span className="legal-separator">  ·  </span>
        <a href={"".concat(SAUCE_HOME, "/support")} target="_blank" rel="noopener noreferrer" className="legal-link">Support</a>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="relish-footer">
        <a href={SAUCE_HOME} target="_blank" rel="noopener noreferrer" className="footer-brand">sauc-e.com</a>
        <p className="footer-tagline">HOME of all of our delicious APPS</p>
        <p className="footer-small">RELISH is for Feelings</p>
        <p className="footer-small">CATSUP (Learning) · BBQE (Safety)</p>
        <p className="footer-tiny">© 2026 3_6_NIFE.pi · 36Nife@gmail.com</p>
      </footer>

    </div>);
}
exports.default = App;
