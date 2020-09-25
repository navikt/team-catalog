<#-- @ftlvariable name="" type="no.nav.data.common.notify.dto.MailModels.UpdateModel" -->
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

<#if deleted?has_content>
  <h2>Slettet</h2>
  <ul>
      <#list deleted as item>
        <li>${item.type}: ${item.name}</a></li>
      </#list>
  </ul>
</#if>

<#if updated?has_content>
  <h2>Endret</h2>
  <ul>
      <#list updated as item>
        <li><a href="${item.url}">${item.type}: ${item.name}</a>
          <ul>
              <#if item.newName()>
                <li>Navn endret fra: <i>${item.fromName}</i> til: <i>${item.toName}</i></li>
              </#if>
              <#if item.newType()>
                <li>Teamtype endret fra: <i>${item.fromType}</i> til: <i>${item.toType}</i></li>
              </#if>
              <#if item.newProductArea()>
                <li>Område endret
                  fra:
                    <#if item.fromProductArea?has_content>
                      <a href="${item.fromProductAreaUrl}">${item.fromProductArea}</a>
                    <#else>
                      <i>ingen</i>
                    </#if>
                  til:
                    <#if item.toProductArea?has_content>
                      <a href="${item.toProductAreaUrl}">${item.toProductArea}</a>
                    <#else>
                      <i>ingen</i>
                    </#if>
                </li>
              </#if>
              <#if item.removedMembers?has_content>
                <li>Fjernet medlem
                  <ul>
                      <#list item.removedMembers as removed>
                        <li><a href="${removed.url}">${removed.name}</a></li>
                      </#list>
                  </ul>
                </li>
              </#if>
              <#if item.newMembers?has_content>
                <li>Nytt medlem
                  <ul>
                      <#list item.newMembers as added>
                        <li><a href="${added.url}">${added.name}</a></li>
                      </#list>
                  </ul>
                </li>
              </#if>
          </ul>
        </li>
      </#list>
  </ul>
</#if>

<div style="margin-top: 50px;">
  <hr/>
  <p>
    Du kan ikke svare på denne eposten. Kontakt oss på <a href="slack://channel?team=T5LNAMWNA&id=CG2S8D25D">#datajegerne</a> for ris og ros. :)
  </p>
  <p>
    Hilsen
    <br/>
    Team Datajegerne
  </p>

  <p style="font-size:.8em;">
    Du mottar denne eposten fordi du har valgt å abonnere på endringsvarsler. Gå inn på <a href="${baseUrl}/user/notifications">Mine varsler i Teamkatalogen</a>
    for å avslutte abonnement eller endre hyppighet på varsler.
  </p>
</div>

</body>
</html>