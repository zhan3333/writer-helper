package main

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func main() {
	rdb := redis.NewClient(&redis.Options{
		Addr: "127.0.0.1:6379",
		DB:   0, // use default DB
	})

	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.GET("/cache/:key", func(c *gin.Context) {
		key := c.Param("key")
		val, err := rdb.Get(c.Request.Context(), key).Result()
		if err != nil {
			if !errors.Is(err, redis.Nil) {
				c.JSON(500, err)
				return
			}
		}
		c.String(200, val)
		return
	})
	r.PUT("/cache/:key", func(c *gin.Context) {
		key := c.Param("key")
		val := c.Query("val")
		err := rdb.Set(c.Request.Context(), key, val, 0).Err()
		if err != nil {
			c.JSON(500, err)
			return
		}
		c.String(200, "ok")
	})
	if err := r.Run(); err != nil {
		panic(err)
	}
}
