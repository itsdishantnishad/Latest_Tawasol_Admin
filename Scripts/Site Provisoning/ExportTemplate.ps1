$tenantName  = "orgessence.onmicrosoft.com"
$clientId = "4d7b6247-17e0-49ea-9f2d-b934d5a8360b"
$path="Enter your path here"

#$siteURL   = "https://orgessence.sharepoint.com/sites/IntranetRevampTawasol"
$siteURL   = "https://orgessence.sharepoint.com/sites/Site_Provisioning_POC"

#Connect to the site
Connect-PnPOnline -Url $siteURL -Interactive -ClientId $clientId -Tenant $tenantName

#Export the term group to an XML file
Export-PnPTermGroupToXml -Identity "Tawasol Intranet" -Out "$path\Taxonomy-Tawasol.xml"

#Export fields to an XML file
Get-PnPSiteTemplate -Out "$path\Fields.xml" -Handlers Fields

#Export Search Schema
Get-PnPSearchConfiguration -Scope Site  -Configuration SearchSchema -Path "$path\Tawasol-SearchSchema.xml"
 
#Export Content Types to an XML file
Get-PnPSiteTemplate -Out "$path\CT-TawasolIntranetGroup.xml" -Handlers ContentTypes -ContentTypeGroups "Tawasol Intranet" -Force

