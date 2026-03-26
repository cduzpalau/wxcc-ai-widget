/**
 * WxCC AI Widget - Simple Solution
 * Mock missing SDK properties before init
 */

import { Desktop } from "@wxcc-desktop/sdk";

class WxccAIWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.desktop = null;
        this.sdkReady = false;
    }

    connectedCallback() {
        console.log('[WxCC AI Widget] Widget connected');
        this.render();
        this.initSDK();
        this.subscribeToAgentContactEvents();
    }

    disconnectedCallback() {
        Desktop.agentContact.removeAllEventListeners();
    }
    
    subscribeToAgentContactEvents () {
        // Listen to contact events
        Desktop.agentContact.addEventListener("eAgentContact", (event) => {
            console.log('[WxCC AI Widget] Contact Event:', event);
        });
    }

    initSDK() {
        console.log('[WxCC AI Widget] Initializing SDK...');
        this.updateStatus('Initializing SDK...');

        try {
            // Initialize Desktop SDK (synchronous call, no await)
            Desktop.config.init();
            
            this.desktop = Desktop;
            this.sdkReady = true;
            
            console.log('[WxCC AI Widget] ✅ SDK Ready!');

            // Make Desktop globally accessible with debug method
            window.Desktop = Desktop;
            Desktop.debugWidget = () => this.debugDesktop();
            
            console.log('[WxCC AI Widget] 💡 Desktop accessible via: window.Desktop');
            console.log('[WxCC AI Widget] 💡 Try: Desktop.debugWidget() on the console!');
    
            this.updateStatus('SDK Ready');
            
        } catch (error) {
            console.error('[WxCC AI Widget] ❌ SDK Error:', error);
            console.error('[WxCC AI Widget] Error stack:', error.stack);
            this.updateStatus(`SDK Error: ${error.message}`);
        }
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    font-family: sans-serif;
                    background: #fff;
                    padding: 20px;
                    box-sizing: border-box;
                }
                
                .status {
                    padding: 15px;
                    background: #f0f7ff;
                    border: 2px solid #049fd9;
                    border-radius: 8px;
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .status.ready {
                    background: #d4edda;
                    border-color: #28a745;
                    color: #155724;
                }
                
                .status.error {
                    background: #f8d7da;
                    border-color: #dc3545;
                    color: #721c24;
                }
                
                .button-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                button {
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                    background-color: #049fd9;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    transition: background-color 0.3s;
                }

                button:hover {
                    background-color: #0377a3;
                }
            </style>
            
            <div id="status" class="status">Initializing...</div>
            <div class="button-container">
                <button id="alertBtn">AI Alert</button>
                <button id="statusBtn">Set Available</button>
                <button id="infoBtn">Agent Info</button>
            </div>
        `;

        this.shadowRoot.getElementById('alertBtn').onclick = () => alert("AI will make us change how we work");
        this.shadowRoot.getElementById('statusBtn').onclick = () => this.setAvailable();
        this.shadowRoot.getElementById('infoBtn').onclick = () => this.showAgentInfo();
    }
    
    async setAvailable() {
        if (!this.sdkReady) {
            alert('SDK not ready yet!');
            return;
        }
        try {
            await this.desktop.agentStateInfo.stateChange({state: 'Available'});
            console.log('[WxCC AI Widget] Successfully changed state to Available');
            this.updateStatus('Status Changed: Available');
        } catch (error) {
            console.error('[WxCC AI Widget] Error changing state:', error);
            alert(`Error changing state: ${error.message}`);
        }
    }

    showAgentInfo() {
        if (!this.sdkReady) {
            alert('SDK not ready yet!');
            return;
        }
        const data = this.desktop.agentStateInfo.latestData;
        alert(`Agent Name: ${data.agentName || 'Unknown'}\nCurrent State: ${data.subStatus || 'Unknown'}`);
    }

    updateStatus(message) {
        const el = this.shadowRoot?.getElementById('status');
        if (el) {
            el.textContent = message;
            el.className = 'status';
            if (message.includes('Ready') || message.includes('Changed')) el.classList.add('ready');
            if (message.includes('Error')) el.classList.add('error');
        }
    }
    
    debugDesktop() {
        if (!this.desktop) {
            console.warn('[WxCC AI Widget] Desktop SDK not initialized yet');
            return;
        }

        console.group('🖥️ Desktop SDK Debug Info');
        
        console.log('1️⃣ All Modules:', Object.keys(this.desktop));
        
        console.group('2️⃣ config');
        console.log('Properties:', Object.keys(this.desktop.config));
        console.log('Methods:', Object.keys(this.desktop.config).filter(k => typeof this.desktop.config[k] === 'function'));
        console.log('Client Locale:', this.desktop.config.clientLocale);
        console.groupEnd();
        
        console.group('3️⃣ agentStateInfo');
        console.log('Properties:', Object.keys(this.desktop.agentStateInfo));
        console.log('Methods:', Object.keys(this.desktop.agentStateInfo).filter(k => typeof this.desktop.agentStateInfo[k] === 'function'));
        console.log('Current State:', this.desktop.agentStateInfo.latestData);
        console.log('Idle Codes:', this.desktop.agentStateInfo.idleCodes);
        console.groupEnd();
        
        console.group('4️⃣ agentContact');
        console.log('Properties:', Object.keys(this.desktop.agentContact));
        console.log('Methods:', Object.keys(this.desktop.agentContact).filter(k => typeof this.desktop.agentContact[k] === 'function'));
        console.log('Task Map:', this.desktop.agentContact.taskMap);
        console.log('Selected Task:', this.desktop.agentContact.taskSelected);
        console.groupEnd();
        
        console.group('5️⃣ actions');
        console.log('Properties:', Object.keys(this.desktop.actions));
        console.log('Methods:', Object.keys(this.desktop.actions).filter(k => typeof this.desktop.actions[k] === 'function'));
        console.groupEnd();
        
        if (this.desktop.dialer) {
            console.group('6️⃣ dialer');
            console.log('Properties:', Object.keys(this.desktop.dialer));
            console.log('Methods:', Object.keys(this.desktop.dialer).filter(k => typeof this.desktop.dialer[k] === 'function'));
            console.groupEnd();
        }
        
        if (this.desktop.screenpop) {
            console.group('7️⃣ screenpop');
            console.log('Properties:', Object.keys(this.desktop.screenpop));
            console.log('Methods:', Object.keys(this.desktop.screenpop).filter(k => typeof this.desktop.screenpop[k] === 'function'));
            console.groupEnd();
        }
        
        if (this.desktop.logger) {
            console.group('8️⃣ logger');
            console.log('Properties:', Object.keys(this.desktop.logger));
            console.log('Methods:', Object.keys(this.desktop.logger).filter(k => typeof this.desktop.logger[k] === 'function'));
            console.groupEnd();
        }
        
        console.groupEnd();
        
        // Make Desktop globally accessible for easy testing
        window.Desktop = this.desktop;
        console.log('💡 Tip: Desktop is now available as window.Desktop');
        console.log('💡 Try: Desktop.agentStateInfo.latestData');
        console.log('💡 Try: Desktop.config.clientLocale');
    }
    
}

customElements.define('wxcc-ai-widget', WxccAIWidget);
console.log('[WxCC AI Widget] Widget loaded');