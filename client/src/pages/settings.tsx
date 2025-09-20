import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Save, Database, Upload } from "lucide-react";

export default function Settings() {
  const handleSave = () => {
    console.log("Save settings");
  };

  const handleBackup = () => {
    console.log("Create database backup");
  };

  const handleImport = () => {
    console.log("Import data");
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">设置</h1>
        <p className="text-muted-foreground">配置系统首选项和管理数据</p>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>外观</CardTitle>
            <CardDescription>自定义应用程序的外观和感觉</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>主题</Label>
                <p className="text-sm text-muted-foreground">选择您喜欢的配色方案</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>公司信息</CardTitle>
            <CardDescription>用于报告和导出的基本公司详情</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">公司名称</Label>
                <Input 
                  id="company-name" 
                  placeholder="枕头靠垫公司" 
                  defaultValue="枕头靠垫公司"
                  data-testid="input-company-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">联系邮箱</Label>
                <Input 
                  id="contact-email" 
                  type="email" 
                  placeholder="contact@pillowcompany.com"
                  data-testid="input-contact-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">地址</Label>
              <Input 
                id="address" 
                placeholder="某市某区制造业大街123号"
                data-testid="input-address"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
            <CardDescription>当前系统信息和健康状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">面料总数</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">配件</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">设计创意</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm text-muted-foreground">产品</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
系统健康
              </Badge>
              <span className="text-sm text-muted-foreground">最后更新：刚刚</span>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>数据管理</CardTitle>
            <CardDescription>备份、导入和导出数据</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={handleBackup} data-testid="button-backup">
                <Database className="h-4 w-4 mr-2" />
创建备份
              </Button>
              <Button variant="outline" onClick={handleImport} data-testid="button-import">
                <Upload className="h-4 w-4 mr-2" />
导入数据
              </Button>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
  建议定期备份以防止数据丢失。导出数据用于报告或迁移目的。
            </p>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button onClick={handleSave} data-testid="button-save-settings">
            <Save className="h-4 w-4 mr-2" />
保存设置
          </Button>
        </div>
      </div>
    </div>
  );
}