$tenantName  = "orgessence.onmicrosoft.com"
$clientId = "4d7b6247-17e0-49ea-9f2d-b934d5a8360b"
$path="Enter your path here"

#$siteURL   = "https://orgessence.sharepoint.com/sites/IntranetRevampTawasol"
$siteURL   = "https://orgessence.sharepoint.com/sites/Site_Provisioning_POC"

#Connect to the site
Connect-PnPOnline -Url $siteURL -Interactive -ClientId $clientId -Tenant $tenantName
 
#Import the term group from an XML file
Import-PnPTermGroupFromXml -Path "$path\Taxonomy-Tawasol.xml"
 
#Import fields from an XML file
Invoke-PnPSiteTemplate  -Path "$path\Fields.xml" -Handlers Fields

#Import Search Schema
Set-PnPSearchConfiguration  -Scope Site -Path "$path\Tawasol-SearchSchema.xml"

#Import Content Types from an XML file
Invoke-PnPSiteTemplate -Path "$path\CT-TawasolIntranetGroup.xml" -Handlers ContentTypes -Handlers ContentTypes