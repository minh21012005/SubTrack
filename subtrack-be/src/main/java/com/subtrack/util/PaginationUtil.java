package com.subtrack.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

public final class PaginationUtil {

    public static final int MAX_PAGE_SIZE = 100;

    private PaginationUtil() {}

    public static PageRequest page(int page, int size, Sort sort) {
        int p = Math.max(0, page);
        int s = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        return PageRequest.of(p, s, sort);
    }
}
