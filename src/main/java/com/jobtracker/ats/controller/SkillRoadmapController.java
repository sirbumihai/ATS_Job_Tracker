package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.roadmap.*;
import com.jobtracker.ats.service.SkillRoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/roadmap")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SkillRoadmapController {

    private final SkillRoadmapService skillRoadmapService;

    @GetMapping("/catalog")
    public ResponseEntity<List<RoadmapSummaryDto>> getCatalog() {
        return ResponseEntity.ok(skillRoadmapService.getCatalog());
    }

    @GetMapping("/{skillId}")
    public ResponseEntity<SkillRoadmapDto> getRoadmap(@PathVariable String skillId) {
        return ResponseEntity.ok(skillRoadmapService.getRoadmap(skillId));
    }

    @PostMapping("/generate")
    public ResponseEntity<SkillRoadmapDto> generateRoadmap(@RequestBody RoadmapGenerateRequest request) {
        return ResponseEntity.ok(skillRoadmapService.generateCustomRoadmap(request));
    }

    @PostMapping("/add-to-cv")
    public ResponseEntity<Map<String, Object>> addSkillToCv(@RequestBody AddSkillToCvRequest request) {
        return ResponseEntity.ok(skillRoadmapService.addSkillToCv(request));
    }
}
