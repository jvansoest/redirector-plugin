browser.storage.local.get(['redirectRules']).then(function(result) {
  const rules = result.redirectRules || [];
  
  if (rules.length > 0) {
    browser.webRequest.onBeforeRequest.addListener(
      function(details) {
        for (let rule of rules) {
          if (rule.enabled && rule.pattern && rule.replacement) {
            try {
              const regex = new RegExp(rule.pattern, 'gi');
              if (regex.test(details.url)) {
                const newUrl = details.url.replace(regex, rule.replacement);
                if (newUrl !== details.url) {
                  return { redirectUrl: newUrl };
                }
              }
            } catch (e) {
              console.error('Invalid regex pattern:', rule.pattern, e);
            }
          }
        }
        return {};
      },
      { urls: ["<all_urls>"] },
      ["blocking"]
    );
  }
});

browser.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.redirectRules) {
    browser.webRequest.onBeforeRequest.removeListener(handleRequest);
    
    const rules = changes.redirectRules.newValue || [];
    if (rules.length > 0) {
      browser.webRequest.onBeforeRequest.addListener(
        handleRequest,
        { urls: ["<all_urls>"] },
        ["blocking"]
      );
    }
  }
});

function handleRequest(details) {
  return new Promise((resolve) => {
    browser.storage.local.get(['redirectRules']).then(function(result) {
      const rules = result.redirectRules || [];
      
      for (let rule of rules) {
        if (rule.enabled && rule.pattern && rule.replacement) {
          try {
            const regex = new RegExp(rule.pattern, 'gi');
            if (regex.test(details.url)) {
              const newUrl = details.url.replace(regex, rule.replacement);
              if (newUrl !== details.url) {
                resolve({ redirectUrl: newUrl });
                return;
              }
            }
          } catch (e) {
            console.error('Invalid regex pattern:', rule.pattern, e);
          }
        }
      }
      resolve({});
    });
  });
}