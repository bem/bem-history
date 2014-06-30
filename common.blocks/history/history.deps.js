({
    /*
        The final choice of provider is in the moment of history module requiring.
        If someone doesn't want to use a hashchange fallback it's possible to overwrite
        this deps, then the simple redirect fallback takes place.
    */
    shouldDeps : ['events', 'inherit', 'jquery', 'uri', { mods : { provider : ['history-api', 'hashchange'] } }]
});
