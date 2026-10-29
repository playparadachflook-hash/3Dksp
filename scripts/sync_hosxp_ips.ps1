<#
.SYNOPSIS
    Real-Time IP & Workstation Sync for Khok Si Suphan Hospital 3D Digital Twin
    Directly queries HOSxP MySQL/MariaDB (192.168.2.254:3306) and local network NetBIOS/ARP.
    Runs every 30 seconds when -Loop is specified.
#>
param(
    [switch]$Loop = $true,
    [int]$IntervalSeconds = 30
)

$root = Split-Path -Parent $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }
Set-Location $root

Write-Host "=== Khok Si Suphan Hospital Real-Time IP Sync Engine ===" -ForegroundColor Cyan
Write-Host "Sync Interval: Every $IntervalSeconds seconds" -ForegroundColor Gray

function Sync-Once {
    $connStr = "Driver={MySQL ODBC 5.1 Driver};Server=192.168.2.254;Port=3306;Database=hos;User=opd;Password=opd;Option=3;"
    $conn = New-Object System.Data.Odbc.OdbcConnection($connStr)

    # 1. Read local ARP table
    $arpOutput = arp -a
    $arpMap = @{}
    foreach ($line in $arpOutput -split "`r?`n") {
        if ($line -match '(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+([0-9a-fA-F-]{17})\s+dynamic') {
            $arpMap[$matches[1]] = $matches[2].ToUpper().Replace('-', ':')
        }
    }

    # 2. Read live network devices map if available
    $netMap = @{}
    $liveNetJson = Join-Path $root "scratch\live_network_devices.json"
    if (Test-Path $liveNetJson) {
        try {
            $devs = Get-Content $liveNetJson -Raw -Encoding UTF8 | ConvertFrom-Json
            foreach ($d in $devs) { $netMap[$d.IP] = $d }
        } catch {}
    }

    try {
        $conn.Open()
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = @"
SELECT 
    o.computername AS ip,
    o.kskloginname AS login,
    u.name AS fullname,
    u.groupname,
    u.entryposition AS position,
    o.department,
    o.ksklogintime AS logintime,
    o.client_version,
    o.os_name
FROM onlineuser o
LEFT JOIN opduser u ON u.loginname = o.kskloginname
ORDER BY o.ksklogintime DESC
"@
        $reader = $cmd.ExecuteReader()
        $dt = New-Object System.Data.DataTable
        $dt.Load($reader)
        $conn.Close()

        $outList = [System.Collections.Generic.List[psobject]]::new()
        $idx = 1
        foreach ($row in $dt.Rows) {
            $ip = [string]$row["ip"]
            $netInfo = if ($netMap.ContainsKey($ip)) { $netMap[$ip] } else { $null }
            $mac = if ($arpMap.ContainsKey($ip)) { $arpMap[$ip] } elseif ($netInfo) { $netInfo.MAC } else { "" }
            $hostname = if ($netInfo -and $netInfo.Hostname) { $netInfo.Hostname } else { "" }
            if (-not $hostname) {
                # Fallback hostname format
                $hostname = "PC-$ip"
            }

            $logintimeStr = if ($row["logintime"] -is [DateTime]) {
                $dtVal = [DateTime]$row["logintime"]
                $thaiYear = $dtVal.Year + 543
                "$($dtVal.Day)/$($dtVal.Month)/$thaiYear $($dtVal.ToString('HH:mm:ss'))"
            } else {
                [string]$row["logintime"]
            }

            $outList.Add([pscustomobject]@{
                No = $idx
                LoginTime = $logintimeStr
                Login = [string]$row["login"]
                FullName = [string]$row["fullname"]
                Computer = $hostname
                BW = $null
                Status = "Online (ปกติ)"
                OS = if ($row["os_name"]) { [string]$row["os_name"] } else { "Windows 11 / 10" }
                IP = $ip
                MAC = $mac
                ClientVersion = [string]$row["client_version"]
                GroupName = [string]$row["groupname"]
                Position = [string]$row["position"]
                Department = [string]$row["department"]
            })
            $idx++
        }

        $outJsonPath = Join-Path $root "hosxp_data.json"
        $outList | ConvertTo-Json -Depth 4 | Set-Content -Path $outJsonPath -Encoding UTF8
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Synced $($outList.Count) active hospital PCs to hosxp_data.json" -ForegroundColor Green
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Sync Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Run sync loop
do {
    Sync-Once
    if ($Loop) {
        Start-Sleep -Seconds $IntervalSeconds
    }
} while ($Loop)
