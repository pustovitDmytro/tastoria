function isSearchFound(search, recipe) {
    const terms = search.split(/\s+/).filter(Boolean).map(w => w.toLowerCase());

    return terms.every(word => recipe.title.toLowerCase().includes(word));
}

export function handleVisibility(r, search, { categories, tags }) {
    const { recipe } = r;
    const needSearch = !!search;
    const bySearch = needSearch && isSearchFound(search, recipe);

    let isVisible = true;

    if (needSearch && !bySearch) isVisible = false;
    if (categories.length > 0 &&
        (!recipe.categories || !categories.some(c => recipe.categories.includes(c.value)))
    ) isVisible = false;
    if (tags.length > 0 &&
        (!recipe.tags || !tags.some(c => recipe.tags.includes(c.value)))
    ) isVisible = false;

    // eslint-disable-next-line no-param-reassign
    r.isVisible.value = isVisible;
}
