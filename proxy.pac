function FindProxyForURL(url, host)
{
    // webpages in local networks
    if (dnsDomainIs(host, "pollmann") ||
        dnsDomainIs(host, "ci.nii.ac.jp") ||
        dnsDomainIs(host, "apollo.gavo.t.u-tokyo.ac.jp") ||
        dnsDomainIs(host, "www.wakayama-u.ac.jp") ||
        dnsDomainIs(host, "gloria.gav.t.u-tokyo.ac.jp") ||
        dnsDomainIs(host, "minerva.gavo.t.u-tokyo.ac.jp") ||
        dnsDomainIs(host, "software.gavo.t.u-tokyo.ac.jp") ||
        dnsDomainIs(host, "www.gavo.t.u-tokyo.ac.jp")
        //&& !shExpMatch(myIpAddress(), "172.19.*") // I'm not in local network
       )
    {
        // if SOCKS is failed, then NOT using proxy
        // return "SOCKS localhost:18080; DIRECT";
        // HTTP proxy
        return "PROXY localhost:10080";
    }
    // webpages in global network
    else
    {
        // NOT using proxy
        return "DIRECT";
    }
}

