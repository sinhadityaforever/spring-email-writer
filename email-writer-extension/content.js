console.log("Email Writer Extension - Content Script Loaded");

function injectButton(){

}

const observer = new MutationObserver((mutations)=>{
  for(const mutation of mutations){
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElements = addedNodes.some(
      node=>node.nodeType === Node.ELEMENT_NODE &&
      (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
     );
     if(hasComposeElements){
        console.log("Email Writer Extension - Compose Element Found");
        setTimeout(injectButton, 500);
     }
  }
})

observer.observe(document.body, {
  childList: true,
  subtree: true
})