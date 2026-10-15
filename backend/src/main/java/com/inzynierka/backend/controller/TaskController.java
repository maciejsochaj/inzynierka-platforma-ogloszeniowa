package com.inzynierka.backend.controller;

import com.inzynierka.backend.model.Task;
import com.inzynierka.backend.repository.TaskRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // Pobranie wszystkich zadań z bazy
    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Zapis nowego zadania do bazy
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskRepository.save(task);
    }
}