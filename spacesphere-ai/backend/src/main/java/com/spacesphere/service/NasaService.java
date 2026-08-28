package com.spacesphere.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class NasaService {

    private static final String BASE_URL = "https://api.nasa.gov";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final RestTemplate restTemplate;

    @Value("${nasa.api.key:DEMO_KEY}")
    private String nasaApiKey;

    public NasaService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /** NASA Astronomy Picture of the Day */
    public JsonNode apod() {
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL + "/planetary/apod")
                .queryParam("api_key", nasaApiKey)
                .toUriString();
        return restTemplate.getForObject(url, JsonNode.class);
    }

    /** Near-Earth Objects close-approach feed for today */
    public JsonNode neoToday() {
        String today = LocalDate.now().format(DATE_FMT);
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL + "/neo/rest/v1/feed")
                .queryParam("start_date", today)
                .queryParam("end_date", today)
                .queryParam("api_key", nasaApiKey)
                .toUriString();
        return restTemplate.getForObject(url, JsonNode.class);
    }

    /** DONKI space weather notifications for the last N days */
    public JsonNode donki(int days) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(days);
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL + "/DONKI/notifications")
                .queryParam("startDate", start.format(DATE_FMT))
                .queryParam("endDate", end.format(DATE_FMT))
                .queryParam("type", "all")
                .queryParam("api_key", nasaApiKey)
                .toUriString();
        return restTemplate.getForObject(url, JsonNode.class);
    }
}
