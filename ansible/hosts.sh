#!/bin/sh

host=$(hostname.exe | tr -d "\r\n")
windows_ip=${WSL_GATEWAY:-127.0.0.1}

cat <<EOF
{
    "_meta": {
        "hostvars": {
            "$host": {
                "ansible_connection": "winrm",
                "ansible_host": "$windows_ip",
                "ansible_port": 5986,
                "ansible_winrm_server_cert_validation": "ignore"
            },
            "localwsl": {
                "ansible_connection": "local"
            }
        }
    },
    "all": {
        "children": [
            "ungrouped",
            "windows10",
            "wsl"
        ]
    },
    "windows10": {
        "hosts": [
            "$host"
        ]
    },
    "wsl": {
        "hosts": [
            "localwsl"
        ]
    }
}
EOF
