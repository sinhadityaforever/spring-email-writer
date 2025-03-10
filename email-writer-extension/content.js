console.log('Email Writer Extension - Content Script Loaded');

function createAIButton() {
  const button = document.createElement('div');
  button.className = 'T-I J-J5-Ji aoO T-I-atl L3';
  button.style.marginRight = '8px';
  button.innerHTML = 'AI Reply';
  button.setAttribute('role', 'button');
  button.setAttribute('data-tooltip', 'Generate AI Reply');
  return button;
}

function createToneSelector() {
  const select = document.createElement('select');
  select.className = 'ai-tone-selector';
  select.style.marginRight = '8px';
  select.style.padding = '4px';
  select.style.border = '1px solid #ccc';
  select.style.borderRadius = '4px';
  select.style.fontSize = '12px';
  select.style.cursor = 'pointer';

  const tones = ['Professional', 'Casual', 'Friendly', 'Sarcastic'];
  tones.forEach((tone) => {
    const option = document.createElement('option');
    option.value = tone.toLowerCase();
    option.innerText = tone;
    select.appendChild(option);
  });

  return select;
}

function getEmailContent() {
  const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) {
      return content.innerText.trim();
    }
  }
  return '';
}

function findComposeToolbar() {
  const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      return toolbar;
    }
  }
  return null;
}

function injectButton() {
  const existingButton = document.querySelector('.ai-reply-button');
  if (existingButton) existingButton.remove();
  const existingSelector = document.querySelector('.ai-tone-selector');
  if (existingSelector) existingSelector.remove();

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log('Toolbar not found');
    return;
  }

  console.log('Toolbar found. Creating AI button and tone selector');

  const toneSelector = createToneSelector();
  const button = createAIButton();
  button.classList.add('ai-reply-button');

  button.addEventListener('click', async () => {
    try {
      button.innerHTML = 'Generating...';
      button.disabled = true;

      const emailContent = getEmailContent();
      const selectedTone = toneSelector.value;

      const response = await fetch("https://email-writer-backend.onrender.com/api/email/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          emailContent,
          tone: selectedTone
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }

      const generatedReply = await response.text();
      const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

      if (composeBox) {
        composeBox.focus();
        document.execCommand('insertText', false, generatedReply);
      } else {
        console.error('Compose box not found');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to generate AI response');
    } finally {
      button.innerHTML = 'AI Reply';
      button.disabled = false;
    }
  });

  toolbar.insertBefore(toneSelector, toolbar.firstChild);
  toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElements = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('.aDh, .btC, [role="dialog"]') ||
          node.querySelector('.aDh, .btC, [role="dialog"]'))
    );
    if (hasComposeElements) {
      console.log('Email Writer Extension - Compose Element Found');
      setTimeout(injectButton, 500);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
