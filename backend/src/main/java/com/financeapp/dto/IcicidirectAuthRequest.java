package com.financeapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class IcicidirectAuthRequest {
    @JsonProperty("AppKey")
    private String appKey;

    @JsonProperty("time_stamp")
    private String timeStamp;

    @JsonProperty("JSONPostData")
    private String jsonPostData;

    @JsonProperty("Checksum")
    private String checksum;

    public String getAppKey() {
        return appKey;
    }

    public void setAppKey(String appKey) {
        this.appKey = appKey;
    }

    public String getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(String timeStamp) {
        this.timeStamp = timeStamp;
    }

    public String getJsonPostData() {
        return jsonPostData;
    }

    public void setJsonPostData(String jsonPostData) {
        this.jsonPostData = jsonPostData;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }
}

