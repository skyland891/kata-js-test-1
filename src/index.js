const searchInput = document.querySelector(".search-input");
const searchResults = document.querySelector(".search-results");
const savedRepos = document.querySelector(".saved-repos");

const createElement = (elemType, className) => {
       const element = document.createElement(elemType);
   element.classList.add(className);

   return element;
}

const createSearchResultNode = (dataset) => {
    const repoNode = createElement('div', 'search-result');
    repoNode.innerHTML = `${dataset.name}`;
    //заполенние dataset
    repoNode.dataset.name = dataset.name;
    repoNode.dataset.owner = dataset.owner;
    repoNode.dataset.stars = dataset.stars;

    return repoNode;
}
/*
const highlight = (node) => {
    node.classList.add('selected');
}
*/
const appendInSavedRepos = (repoNode) => {
    const savedRepoNode = createElement('div', 'saved-repo');

    const repoInfoWrapper = createElement('div', 'repo-wrapper');
    const button = createElement('button', 'btn');
    // Заполнение repoInfoWrapper
    const repoName = createElement('span', 'name');
    repoName.innerHTML = `Name: ${repoNode.dataset.name}`;
    const repoOwner = createElement('span', 'owner');
    repoOwner.innerHTML = `Owner: ${repoNode.dataset.owner}`;
    const repoStars = createElement('span', 'stars');
    repoStars.innerHTML = `Stars: ${repoNode.dataset.stars}`;

    repoInfoWrapper.append(repoName, repoOwner, repoStars);

    savedRepoNode.append(repoInfoWrapper, button);

    savedRepos.append(savedRepoNode);
}

const autoComplite = (repos) => {
    if(searchResults.hasChildNodes()) {
        searchResults.innerHTML = '';
    }
    repos.forEach(repo => {
        const node = createSearchResultNode({name: repo.name, owner: repo.owner.login, stars: repo.stargazers_count});
        searchResults.append(node);
    });

}

const debounce = (fn, debounceTime) => {
    let timer;
    return  function(...args) {
        clearTimeout(timer);
        timer = setTimeout(async () => {
            const data = await fn.apply(this, args);
            console.log(data);
            if(data){
                const firstFiveRepos = data.items.slice(0, 5);
                autoComplite(firstFiveRepos);
            }
            else {
                searchResults.innerHTML = '';
            }
        }, debounceTime);
    }
};

async function getRepos(querySubString) {
    const isEmpty = querySubString.split(" ").join("") === '';
    if(isEmpty) {
        return null;
    }
    const queryString = `q=${querySubString}&sort=stars&order=desc`;
    let response = null;
    let data = null;
    try {
        response = await fetch(`https://api.github.com/search/repositories?${queryString}`);
        data = await response.json();
    }
    catch(error) {
        throw error;
    }
    return data;
}

const searchDebounce = debounce(getRepos, 250);

searchResults.addEventListener('click', (event) => {
    let repo = event.target.closest('.search-result');
    if(!repo) {
        return;
    }
    //highlight(repo);
    appendInSavedRepos(repo);
    searchInput.value = '';
    searchResults.innerHTML = '';
});

savedRepos.addEventListener('click', (event) => {
    let button = event.target.closest('.btn');
    if(!button) {
        return;
    }

    let repo = button.parentElement;
    repo.remove();
});

searchInput.addEventListener('input', (event) => {
    searchDebounce(event.target.value);
});