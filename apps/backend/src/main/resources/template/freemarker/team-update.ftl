<#-- @ftlvariable name="" type="no.nav.data.common.notify.NotificationMailGenerator.UpdateModel" -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <title>Oppdatering fra Teamkatalog</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body>
<#macro timeText time>
    <#switch time>
        <#case "ALL">
            <#break>
        <#case "DAILY">
          siste dag
            <#break>
        <#case "WEEKLY">
          siste uke
            <#break>
        <#case "MONTHLY">
          siste måned
            <#break>
    </#switch>
</#macro>

<h1>Oppdateringer i teamkatalog <@timeText time=time/></h1>

<#if created?has_content>
  <h2>Opprettet</h2>
  <ul>
      <#list created as item>
        <li><a href="${item.url}">${item.type}: ${item.name}</a></li>
      </#list>
  </ul>
</#if>

<#if updated?has_content>
  <h2>Endret</h2>
  <ul>
      <#list updated as item>
        <li><a href="${item.url}">${item.type}: ${item.name}</a></li>
      </#list>
  </ul>
</#if>

<#if deleted?has_content>
  <h2>Slettet</h2>
  <ul>
      <#list deleted as item>
        <li>${item.type}: ${item.name}</a></li>
      </#list>
  </ul>
</#if>

</body>
</html>