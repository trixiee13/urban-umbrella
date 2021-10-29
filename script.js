const form = document.querySelector('form');
const submitFormBtn = document.getElementById('action-add-url')
const compareBtn = document.getElementById('action-compare')
const competitorInput = document.getElementById('competitor-input')
const formError = document.getElementById('form-error')
const competitorsWrapper = document.getElementById('added-competitors-wrapper')
const competitorsCount = document.getElementById('competitors-count')
const submittedDomains = [];

const inputErrors = {
  input_empty: 'Please add a domain.',
  already_exists: 'The domain added already exists in your list.',
  invalid_format: 'The domain added has an invalid format.',
  invalid_request: 'The domain added does not exist.'
}

handleDomainInitialValidation = (testDomain) => {
  if (!testDomain) return { error: inputErrors.input_empty };

  const found = submittedDomains.find(({ domain }) => domain === testDomain)
  if (found !== undefined) return { error: inputErrors.already_exists };


  const hasDot = testDomain.includes('.');
  if (!hasDot) return { error: inputErrors.invalid_format }

  return { success: true }
}

handleAddHTTP = (testDomain) => {
  let url = null;
  let domain = null;

  if (!testDomain.includes('https://')) {
    domain = testDomain
    url = `https://${testDomain}`
  } else {
    domain = testDomain.split('https://')[1]
    url = testDomain
  }

  return { domain, url }
}

handleDomainRequestValidation = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const resp = await fetch(url, { mode: 'no-cors', signal: controller.signal  })

    clearTimeout(timeoutId)

    if (resp.status === 200 || resp.type === 'opaque') return { success: true }
    return { error: inputErrors.invalid_request }
  } catch (error) {
    return { error: inputErrors.invalid_request }
  }
}

handleUpdateCompareAvailable = () => {
  const selectedDomainsCount = [...submittedDomains].filter(domain => domain.selected).length;
  competitorsCount.innerHTML = selectedDomainsCount;

  if (selectedDomainsCount >= 3) {
    compareBtn.removeAttribute('disabled')
  } else {
    compareBtn.setAttribute('disabled', true)
  }
}

handleSelectDeselectItem = (e) => {
  const domainId = parseInt(e.target.dataset.id);

  const domain = submittedDomains.find(({id}) => id === domainId);
  const isSelected =  domain.selected;

  if (isSelected) {
    domain.selected = false;
    e.target.parentElement.classList.remove('selected')
  } else {
    domain.selected = true;
    e.target.parentElement.classList.add('selected')
  }

  handleUpdateCompareAvailable();
}

handleRerenderDomains = () => {
  const list = document.createElement('ul')

  submittedDomains.forEach(submitted => {
    const listItem = document.createElement('li')
    const listItemBtn = document.createElement('button')
    const listItemImage = document.createElement('img')
    const listItemText = document.createElement('span')
    const listItemSelected = document.createElement('i')

    listItemText.innerHTML = submitted.domain;
    listItemImage.src = `https://www.google.com/s2/favicons?domain=${submitted.domain}`
    listItem.classList.add('pill')
    if (submitted.selected) {
      listItem.classList.add('selected')
    }
    listItemSelected.classList.add('fas')
    listItemSelected.classList.add('fa-check-circle')

    listItemBtn.appendChild(listItemImage)
    listItemBtn.appendChild(listItemText)
    listItemBtn.appendChild(listItemSelected)
    listItemBtn.dataset.id = submitted.id
    listItemBtn.addEventListener('click', handleSelectDeselectItem)

    listItem.appendChild(listItemBtn)
    list.appendChild(listItem)
  })

  competitorsWrapper.innerHTML = ''
  competitorsWrapper.appendChild(list);
}

handleAddDomainToList = (domain) => {
  submittedDomains.push({ ...domain, id:submittedDomains.length, selected: true })

  handleRerenderDomains();
  handleUpdateCompareAvailable();
}

competitorInput.addEventListener('input', (e) => {
  formError.innerHTML = '';
  form.classList.remove('error');
})

submitFormBtn.addEventListener('click', async (e) => {
  e.preventDefault()
  const testDomain = competitorInput.value
  const savedDomain = {
    domain: null,
    url: null
  }

  const initialValidation = handleDomainInitialValidation(testDomain)

  if (initialValidation.error) {
    form.classList.add('error');
    formError.innerHTML = initialValidation.error;
  }

  if (initialValidation.success) {
    const { domain, url } = handleAddHTTP(testDomain);
    savedDomain.domain = domain;
    savedDomain.url = url;

    const requestValidation = await handleDomainRequestValidation(savedDomain.url)

    if (requestValidation.error) {
      form.classList.add('error');
      formError.innerHTML = requestValidation.error;
    }

    if (requestValidation.success) {
      competitorInput.value = ''
      handleAddDomainToList(savedDomain)
    }
  }
})

compareBtn.addEventListener('click', () => {
  window.location.href = 'result.html'
})


// init
handleUpdateCompareAvailable()