package no.nav.data.team.shared.domain;

import no.nav.data.common.exceptions.ValidationException;

import java.util.Arrays;
import java.util.List;

public enum DomainObjectStatus {
    ACTIVE,PLANNED,INACTIVE;

    public static List<DomainObjectStatus> fromQueryParameter(String statusQueryParameter) {
        var stringStatus = statusQueryParameter;
        var strList = stringStatus.split(",");

        if(strList.length>3){
            throw new ValidationException("Status list too long, max is 3");
        }

        var procesedStrList = Arrays.stream(strList).map(it -> it.trim()).map(it -> it.toUpperCase()).toList();
        procesedStrList.forEach(it -> {if(!List.of("ACTIVE","PLANNED","INACTIVE").contains(it)){
            throw new ValidationException("Invalid status parameter: " + it);
        }});


        return procesedStrList.stream().map(it -> DomainObjectStatus.valueOf(it)).toList();
    }
}
