package com.stayease.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    private Short id;

    @Column(nullable = false, unique = true, length = 20)
    private String name;
}
