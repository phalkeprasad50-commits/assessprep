package com.prasad.assessprep.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.prasad.assessprep.dto.Dtos.*;
import com.prasad.assessprep.service.TestService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tests")
public class TestController {
    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @PostMapping("/start")
    public StartTestResponse start(Authentication auth, @Valid @RequestBody StartTestRequest req) {
        return testService.start(auth.getName(), req);
    }

    @PostMapping("/{id}/submit")
    public ResultResponse submit(Authentication auth, @PathVariable Long id, @Valid @RequestBody SubmitRequest req) {
        return testService.submit(auth.getName(), id, req);
    }

    @GetMapping("/{id}/result")
    public ResultResponse result(Authentication auth, @PathVariable Long id) {
        return testService.getResult(auth.getName(), id);
    }

    @GetMapping("/history")
    public List<HistoryItem> history(Authentication auth) {
        return testService.history(auth.getName());
    }
}
