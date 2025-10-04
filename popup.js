document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
  loadRules();
  
  document.getElementById('addRule').addEventListener('click', addRule);
  
  function addRule() {
    const pattern = document.getElementById('pattern').value.trim();
    const replacement = document.getElementById('replacement').value.trim();
    
    if (!pattern || !replacement) {
      alert('Please fill in both pattern and replacement fields');
      return;
    }
    
    try {
      new RegExp(pattern);
    } catch (e) {
      alert('Invalid regex pattern: ' + e.message);
      return;
    }
    
    browser.storage.local.get(['redirectRules']).then(function(result) {
      const rules = result.redirectRules || [];
      rules.push({
        id: Date.now(),
        pattern: pattern,
        replacement: replacement,
        enabled: true
      });
      
      browser.storage.local.set({ redirectRules: rules }).then(function() {
        document.getElementById('pattern').value = '';
        document.getElementById('replacement').value = '';
        loadRules();
      });
    });
  }
  
  function loadRules() {
    browser.storage.local.get(['redirectRules']).then(function(result) {
      console.log('Storage result:', result);
      const rules = result.redirectRules || [];
      console.log('Rules found:', rules);
      const rulesList = document.getElementById('rulesList');
      
      if (rules.length === 0) {
        rulesList.innerHTML = '<p>No rules configured</p>';
        return;
      }
      
      rulesList.innerHTML = '';
      
      rules.forEach(function(rule) {
        const ruleDiv = document.createElement('div');
        ruleDiv.style.border = '1px solid #ccc';
        ruleDiv.style.padding = '10px';
        ruleDiv.style.margin = '5px 0';
        
        const patternDiv = document.createElement('div');
        patternDiv.innerHTML = `<strong>Pattern:</strong> ${escapeHtml(rule.pattern)}`;
        
        const replacementDiv = document.createElement('div');
        replacementDiv.innerHTML = `<strong>Replacement:</strong> ${escapeHtml(rule.replacement)}`;
        
        const controlsDiv = document.createElement('div');
        
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = rule.enabled;
        checkbox.addEventListener('change', function() {
          toggleRule(rule.id);
        });
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' Enabled'));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.addEventListener('click', function() {
          deleteRule(rule.id);
        });
        
        controlsDiv.appendChild(label);
        controlsDiv.appendChild(deleteBtn);
        
        ruleDiv.appendChild(patternDiv);
        ruleDiv.appendChild(replacementDiv);
        ruleDiv.appendChild(controlsDiv);
        
        rulesList.appendChild(ruleDiv);
      });
    });
  }
  
  window.toggleRule = function(ruleId) {
    browser.storage.local.get(['redirectRules']).then(function(result) {
      const rules = result.redirectRules || [];
      const rule = rules.find(r => r.id === ruleId);
      if (rule) {
        rule.enabled = !rule.enabled;
        browser.storage.local.set({ redirectRules: rules });
      }
    });
  };
  
  window.deleteRule = function(ruleId) {
    browser.storage.local.get(['redirectRules']).then(function(result) {
      const rules = result.redirectRules || [];
      const filteredRules = rules.filter(r => r.id !== ruleId);
      browser.storage.local.set({ redirectRules: filteredRules }).then(function() {
        loadRules();
      });
    });
  };
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});