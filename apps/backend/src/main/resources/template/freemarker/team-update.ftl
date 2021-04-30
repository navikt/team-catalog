<#-- @ftlvariable name="" type="no.nav.data.team.notify.dto.MailModels.UpdateModel" -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <title>Oppdatering fra Teamkatalog</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body>
<#macro timeText time>
<#-- @ftlvariable name="time" type="no.nav.data.team.notify.domain.Notification.NotificationTime" -->
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

<#macro itemNameTyped item>
<#-- @ftlvariable name="item" type="no.nav.data.team.notify.dto.MailModels.TypedItem" -->
    <#if item.deleted>
        ${item.formatName()}
    <#else>
      <a href="${item.url}?source=updatemail">${item.formatName()}</a>
    </#if>
</#macro>

<#macro resourceName item>
<#-- @ftlvariable name="item" type="no.nav.data.team.notify.dto.MailModels.Resource" -->
  <a href="${item.url}?source=updatemail">${item.name}</a>
</#macro>

<h1>Oppdateringer i teamkatalog <@timeText time=time/></h1>

<#if created?has_content>
  <h2>Opprettet</h2>
  <ul>
      <#list created as item>
        <li><@itemNameTyped item/></li>
      </#list>
  </ul>
</#if>

<#if deleted?has_content>
  <h2>Slettet</h2>
  <ul>
      <#list deleted as item>
        <li><@itemNameTyped item/></li>
      </#list>
  </ul>
</#if>

<#if updated?has_content>
  <h2>Endret</h2>
  <ul>
      <#list updated as item>
        <li><@itemNameTyped item.item/>
          <ul>
              <#if item.newName()>
                <li>Navn endret fra: <i>${item.fromName}</i> til: <i>${item.toName}</i></li>
              </#if>
              <#if item.newType()>
                <li>Type endret fra: <i>${item.fromType?has_content?then(item.fromType, "ingen")}</i> til: <i>${item.toType}</i></li>
              </#if>
              <#if item.newProductArea()>
                <li>Område endret
                  fra:
                    <#if item.oldProductArea??>
                      <a href="${item.fromProductAreaUrl}?source=updatemail">${item.fromProductArea}</a>
                    <#else>
                      <i>ingen</i>
                    </#if>
                  til:
                    <#if item.newProductArea??>
                      <a href="${item.toProductAreaUrl}?source=updatemail">${item.toProductArea}</a>
                    <#else>
                      <i>ingen</i>
                    </#if>
                </li>
              </#if>
              <#if item.removedMembers?has_content>
                <li>Fjernet medlem
                  <ul>
                      <#list item.removedMembers as removed>
                        <li><@resourceName removed/></li>
                      </#list>
                  </ul>
                </li>
              </#if>
              <#if item.newMembers?has_content>
                <li>Nytt medlem
                  <ul>
                      <#list item.newMembers as added>
                        <li><@resourceName added/></li>
                      </#list>
                  </ul>
                </li>
              </#if>
              <#if item.newTeams?has_content>
                <li>Nytt team
                  <ul>
                      <#list item.newTeams as added>
                        <li><@itemNameTyped added/></li>
                      </#list>
                  </ul>
                </li>
              </#if>
              <#if item.removedTeams?has_content>
                <li>Fjernet team
                  <ul>
                      <#list item.removedTeams as removed>
                        <li><@itemNameTyped removed/></li>
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
    Du kan ikke svare på denne eposten. Kontakt oss på <a href="slack://channel?team=T5LNAMWNA&id=CG2S8D25D">#teamkatalogen</a> for ris og ros. :)
  </p>
  <p>
    Hilsen
    <br/>
    Teamkatalogen
  </p>

  <p style="font-size:.8em;">
    Du mottar denne eposten fordi du har valgt å abonnere på endringsvarsler. Gå inn på <a href="${baseUrl}/user/notifications?source=updatemail">Mine varsler i Teamkatalogen</a>
    for å avslutte abonnement eller endre hyppighet på varsler.
  </p>
</div>

</body>
</html>