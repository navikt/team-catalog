<#-- @ftlvariable name="" type="no.nav.data.team.notify.dto.MailModels.NudgeModel" -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <title>Påminnelse om å sjekke ${targetType} ${targetName} i teamkatalogen</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body>

<h1>Påminnelse om å sjekke ${targetType} ${targetName} i teamkatalogen</h1>

<p>Hei, det har nå gått over ${cutoffTime} siden <a href="${targetUrl}?source=nudgemail">${targetType} ${targetName}</a> ble sist oppdatert.</p>
<p>Som ${recipientRole} mottar du derfor en påminnelse for å sikre at innholdet er korrekt.</p>

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
    Du mottar denne eposten fordi du er satt som ${recipientRole} på ${targetType} ${targetName}. Gå inn på <a href="${targetUrl}?source=nudgemail">Teamkatalogen</a> for å endre.
  </p>
</div>

</body>
</html>