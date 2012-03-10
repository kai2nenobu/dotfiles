function FindProxyForURL(url, host)
{
    // webpages in local networks
    if (dnsDomainIs(host, "pollmann") ||
        dnsDomainIs(host, "ci.nii.ac.jp") ||
        dnsDomainIs(host, "apollo.gavo.t.u-tokyo.ac.jp") ||
        dnsDomainIs(host, "www.wakayama-u.ac.jp") ||
        dnsDomainIs(host, "gloria.gav.t.u-tokyo.ac.jp") ||
        dnsDomainIs(host, "minerva.gavo.t.u-tokyo.ac.jp") ||
        dnsDomainIs(host, "soft1.gavo.t.u-tokyo.ac.jp")
        // shExpMatch(host, "192.168.*")
       )
    {
        // if SOCKS is failed, then NOT using proxy
        // return "SOCKS localhost:18080; DIRECT";
        // HTTP proxy
        return "PROXY localhost:18080";
    }
    // webpages in global network
    else
    {
        // NOT using proxy
        return "DIRECT";
    }
}

