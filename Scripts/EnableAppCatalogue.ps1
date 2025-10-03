
# $AdminUrl = "https://1tvpsn-admin.sharepoint.com"
$AdminUrl = "https://orgessence-admin.sharepoint.com/"

$SiteUrl = "https://orgessence.sharepoint.com/sites/IntranetRevampTawasol"


Write-Host "Connecting to SharePoint Admin Site '$($AdminUrl)'" -f Yellow
Connect-PnPOnline -Url $AdminUrl -UseWebLogin


Write-Host "Adding site collection app catalog to site '$($SiteUrl)'..." -f Yellow
Add-PnPSiteCollectionAppCatalog -Site $SiteUrl

Disconnect-PnPOnline
Write-Host "Finished" -ForegroundColor Green
