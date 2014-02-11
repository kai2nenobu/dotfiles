function FindProxyForURL(url, host)
{
    if (dnsDomainIs(host, 'chinachu') ||
        dnsDomainIs(host, 'rubner-tv')
       )
    {
        // if SOCKS is failed, then NOT using proxy
        return 'SOCKS localhost:18080; DIRECT';
    }
    else
    {
        // NOT using proxy
        return 'DIRECT';
    }
}

