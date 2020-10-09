<#-- @ftlvariable name="" type="no.nav.data.team.notify.dto.MailModels.InactiveModel" -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <title>Medlemmer av ${targetType} ${targetName} i teamkatalogen har blitt inaktive</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body>

<h1>Medlemmer av ${targetType} ${targetName} i teamkatalogen har blitt inaktive</h1>

<p>Hei, <a href="${targetUrl}?source=inactivemail">${targetType} ${targetName}</a> har nå fått inaktive medlem(mer)</p>
<p>Som ${recipientRole} mottar du derfor en påminnelse for å sikre at innholdet er korrekt.</p>
<br/>

<h4>Nye inaktive medlemmer:</h4>
<ul>
    <#list members as item>
      <li><a href="${item.url}?source=inactivemail">${item.name}</a></li>
    </#list>
</ul>

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
    Du mottar denne eposten fordi du er satt som ${recipientRole} på ${targetType} ${targetName}. Gå inn på <a href="${targetUrl}?source=inactivemail">Teamkatalogen</a> for å endre.
  </p>
</div>

</body>
</html>