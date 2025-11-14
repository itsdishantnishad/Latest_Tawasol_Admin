Connect-PnPOnline https://orgessence.sharepoint.com/sites/IntranetRevampTawasol -Interactive -ClientId 

$themepalette=@{
"themePrimary" = "#dda160";
"themeLighterAlt" = "#fefbf8";
"themeLighter" = "#faefe3";
"themeLight" = "#f5e1cb";
"themeTertiary" = "#ebc49b";
"themeSecondary" = "#e2ab71";
"themeDarkAlt" = "#c89156";
"themeDark" = "#a97a49";
"themeDarker" = "#7c5a35";
"neutralLighterAlt" = "#f3e6db";
"neutralLighter" = "#efe2d7";
"neutralLight" = "#e5d9ce";
"neutralQuaternaryAlt" = "#d6cac0";
"neutralQuaternary" = "#ccc1b8";
"neutralTertiaryAlt" = "#c4b9b0";
"neutralTertiary" = "#595959";
"neutralSecondary" = "#373737";
"neutralSecondaryAlt" = "#373737";
"neutralPrimaryAlt" = "#2f2f2f";
"neutralPrimary" = "#000000";
"neutralDark" = "#151515";
"black" = "#0b0b0b";
"white" = "#f9ece1";
}

Add-PnPTenantTheme -Identity "TawasolTheme" -Palette $themepalette -IsInverted $false -Overwrite 